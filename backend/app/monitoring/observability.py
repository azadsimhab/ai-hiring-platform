"""
Observability and Monitoring System for AI Hiring Platform
Production-ready monitoring, logging, metrics, and tracing
"""

import logging
import time
import json
import traceback
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from contextlib import contextmanager
import asyncio
from functools import wraps

# Google Cloud Monitoring and Logging
from google.cloud import monitoring_v3
from google.cloud import logging as cloud_logging
from google.cloud import trace_v2
from google.cloud import error_reporting

# Prometheus metrics
from prometheus_client import Counter, Histogram, Gauge, Summary, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client.exposition import start_http_server

# OpenTelemetry for distributed tracing
from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

from app.core.config import settings

# Configure logging
if settings.ENVIRONMENT == "production":
    client = cloud_logging.Client()
    client.setup_logging()
else:
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format=settings.LOG_FORMAT
    )

logger = logging.getLogger(__name__)

class ObservabilityManager:
    """Central observability manager for the AI hiring platform"""
    
    def __init__(self):
        self.project_id = settings.GCP_PROJECT_ID
        self.environment = settings.ENVIRONMENT
        
        # Initialize Google Cloud clients
        if self.environment == "production":
            self.monitoring_client = monitoring_v3.MetricServiceClient()
            self.logging_client = cloud_logging.Client()
            self.error_client = error_reporting.Client()
            
            # Initialize OpenTelemetry tracing
            self._setup_tracing()
        
        # Initialize Prometheus metrics
        self._setup_prometheus_metrics()
        
        # Performance tracking
        self.performance_metrics = {}
        self.error_counts = {}
        self.api_latency = {}
        
    def _setup_tracing(self):
        """Setup OpenTelemetry distributed tracing"""
        try:
            # Create tracer provider
            tracer_provider = TracerProvider()
            
            # Add Cloud Trace exporter
            cloud_trace_exporter = CloudTraceSpanExporter()
            tracer_provider.add_span_processor(
                BatchSpanProcessor(cloud_trace_exporter)
            )
            
            # Set global tracer provider
            trace.set_tracer_provider(tracer_provider)
            
            # Get tracer
            self.tracer = trace.get_tracer(__name__)
            
            logger.info("Distributed tracing initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize tracing: {e}")
    
    def _setup_prometheus_metrics(self):
        """Setup Prometheus metrics"""
        try:
            # API metrics
            self.request_counter = Counter(
                'http_requests_total',
                'Total HTTP requests',
                ['method', 'endpoint', 'status']
            )
            
            self.request_duration = Histogram(
                'http_request_duration_seconds',
                'HTTP request duration',
                ['method', 'endpoint']
            )
            
            self.active_requests = Gauge(
                'http_active_requests',
                'Number of active HTTP requests',
                ['method', 'endpoint']
            )
            
            # Business metrics
            self.hiring_requests_total = Counter(
                'hiring_requests_total',
                'Total hiring requests created',
                ['status', 'department']
            )
            
            self.candidates_processed = Counter(
                'candidates_processed_total',
                'Total candidates processed',
                ['screening_type', 'result']
            )
            
            self.ai_operations = Counter(
                'ai_operations_total',
                'Total AI operations performed',
                ['operation_type', 'model', 'status']
            )
            
            # System metrics
            self.database_connections = Gauge(
                'database_connections_active',
                'Number of active database connections'
            )
            
            self.memory_usage = Gauge(
                'memory_usage_bytes',
                'Memory usage in bytes'
            )
            
            self.cpu_usage = Gauge(
                'cpu_usage_percent',
                'CPU usage percentage'
            )
            
            # Error metrics
            self.error_counter = Counter(
                'errors_total',
                'Total errors',
                ['error_type', 'endpoint']
            )
            
            # Security metrics
            self.security_events = Counter(
                'security_events_total',
                'Total security events',
                ['event_type', 'severity']
            )
            
            # Start Prometheus metrics server
            if self.environment == "production":
                start_http_server(8000)
                logger.info("Prometheus metrics server started on port 8000")
                
        except Exception as e:
            logger.error(f"Failed to setup Prometheus metrics: {e}")
    
    @contextmanager
    def trace_operation(self, operation_name: str, attributes: Optional[Dict[str, Any]] = None):
        """Context manager for tracing operations"""
        if self.environment == "production" and hasattr(self, 'tracer'):
            with self.tracer.start_as_current_span(operation_name, attributes=attributes or {}) as span:
                try:
                    yield span
                except Exception as e:
                    span.set_attribute("error", True)
                    span.set_attribute("error.message", str(e))
                    raise
        else:
            yield None
    
    def log_structured_event(self, event_type: str, data: Dict[str, Any], level: str = "INFO"):
        """Log structured events with metadata"""
        try:
            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "event_type": event_type,
                "environment": self.environment,
                "data": data,
                "service": "ai-hiring-platform",
                "version": settings.VERSION
            }
            
            if level.upper() == "ERROR":
                logger.error(json.dumps(log_entry))
            elif level.upper() == "WARNING":
                logger.warning(json.dumps(log_entry))
            else:
                logger.info(json.dumps(log_entry))
                
        except Exception as e:
            logger.error(f"Failed to log structured event: {e}")
    
    def track_api_request(self, method: str, endpoint: str, status_code: int, duration: float):
        """Track API request metrics"""
        try:
            # Update Prometheus metrics
            self.request_counter.labels(method=method, endpoint=endpoint, status=status_code).inc()
            self.request_duration.labels(method=method, endpoint=endpoint).observe(duration)
            
            # Track performance metrics
            key = f"{method}_{endpoint}"
            if key not in self.api_latency:
                self.api_latency[key] = []
            
            self.api_latency[key].append(duration)
            
            # Keep only last 1000 requests for performance tracking
            if len(self.api_latency[key]) > 1000:
                self.api_latency[key] = self.api_latency[key][-1000:]
                
        except Exception as e:
            logger.error(f"Failed to track API request: {e}")
    
    def track_business_metric(self, metric_type: str, **labels):
        """Track business-specific metrics"""
        try:
            if metric_type == "hiring_request":
                self.hiring_requests_total.labels(**labels).inc()
            elif metric_type == "candidate_processed":
                self.candidates_processed.labels(**labels).inc()
            elif metric_type == "ai_operation":
                self.ai_operations.labels(**labels).inc()
            elif metric_type == "security_event":
                self.security_events.labels(**labels).inc()
                
        except Exception as e:
            logger.error(f"Failed to track business metric: {e}")
    
    def record_error(self, error: Exception, context: Optional[Dict[str, Any]] = None):
        """Record error with context"""
        try:
            error_type = type(error).__name__
            error_message = str(error)
            
            # Update error counter
            self.error_counter.labels(error_type=error_type, endpoint=context.get('endpoint', 'unknown')).inc()
            
            # Log error with context
            error_data = {
                "error_type": error_type,
                "error_message": error_message,
                "traceback": traceback.format_exc(),
                "context": context or {}
            }
            
            self.log_structured_event("error", error_data, level="ERROR")
            
            # Send to Google Cloud Error Reporting in production
            if self.environment == "production":
                self.error_client.report_exception()
                
        except Exception as e:
            logger.error(f"Failed to record error: {e}")
    
    def monitor_performance(self, operation_name: str, duration: float):
        """Monitor operation performance"""
        try:
            if operation_name not in self.performance_metrics:
                self.performance_metrics[operation_name] = []
            
            self.performance_metrics[operation_name].append(duration)
            
            # Keep only last 1000 measurements
            if len(self.performance_metrics[operation_name]) > 1000:
                self.performance_metrics[operation_name] = self.performance_metrics[operation_name][-1000:]
                
            # Alert if performance degrades
            if len(self.performance_metrics[operation_name]) >= 10:
                avg_duration = sum(self.performance_metrics[operation_name][-10:]) / 10
                if avg_duration > 5.0:  # Alert if average > 5 seconds
                    self._send_performance_alert(operation_name, avg_duration)
                    
        except Exception as e:
            logger.error(f"Failed to monitor performance: {e}")
    
    def _send_performance_alert(self, operation_name: str, avg_duration: float):
        """Send performance alert"""
        try:
            alert_data = {
                "operation": operation_name,
                "average_duration": avg_duration,
                "threshold": 5.0,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.log_structured_event("performance_alert", alert_data, level="WARNING")
            
            # Send to monitoring system in production
            if self.environment == "production":
                self._send_to_monitoring("performance_degradation", alert_data)
                
        except Exception as e:
            logger.error(f"Failed to send performance alert: {e}")
    
    def _send_to_monitoring(self, metric_type: str, data: Dict[str, Any]):
        """Send custom metrics to Google Cloud Monitoring"""
        try:
            series = monitoring_v3.TimeSeries()
            series.metric.type = f"custom.googleapis.com/{metric_type}"
            series.resource.type = "global"
            series.resource.labels["project_id"] = self.project_id
            
            # Add metric labels
            for key, value in data.items():
                if key != "timestamp":
                    series.metric.labels[key] = str(value)
            
            # Set metric value
            point = monitoring_v3.Point()
            point.value.double_value = data.get("average_duration", 0.0)
            point.interval.end_time.seconds = int(time.time())
            series.points = [point]
            
            # Write the time series
            self.monitoring_client.create_time_series(
                request={
                    "name": self.monitoring_client.common_project_path(self.project_id),
                    "time_series": [series],
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to send to monitoring: {e}")
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get metrics summary for health checks"""
        try:
            summary = {
                "timestamp": datetime.utcnow().isoformat(),
                "environment": self.environment,
                "service": "ai-hiring-platform",
                "version": settings.VERSION,
                "metrics": {
                    "api_requests": {},
                    "errors": {},
                    "performance": {},
                    "business": {}
                }
            }
            
            # API metrics summary
            for key, latencies in self.api_latency.items():
                if latencies:
                    summary["metrics"]["api_requests"][key] = {
                        "avg_latency": sum(latencies) / len(latencies),
                        "min_latency": min(latencies),
                        "max_latency": max(latencies),
                        "request_count": len(latencies)
                    }
            
            # Error summary
            summary["metrics"]["errors"] = dict(self.error_counts)
            
            # Performance summary
            for operation, durations in self.performance_metrics.items():
                if durations:
                    summary["metrics"]["performance"][operation] = {
                        "avg_duration": sum(durations) / len(durations),
                        "min_duration": min(durations),
                        "max_duration": max(durations),
                        "operation_count": len(durations)
                    }
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to get metrics summary: {e}")
            return {"error": str(e)}
    
    def health_check(self) -> Dict[str, Any]:
        """Health check for the observability system"""
        try:
            health_status = {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "components": {
                    "logging": "healthy",
                    "metrics": "healthy",
                    "tracing": "healthy" if self.environment == "production" else "disabled",
                    "monitoring": "healthy" if self.environment == "production" else "disabled"
                }
            }
            
            # Check if any components are unhealthy
            unhealthy_components = [
                component for component, status in health_status["components"].items()
                if status != "healthy"
            ]
            
            if unhealthy_components:
                health_status["status"] = "degraded"
                health_status["unhealthy_components"] = unhealthy_components
            
            return health_status
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

# Decorators for easy monitoring
def monitor_operation(operation_name: str):
    """Decorator to monitor function performance"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                observability.monitor_performance(operation_name, duration)
                return result
            except Exception as e:
                duration = time.time() - start_time
                observability.monitor_performance(operation_name, duration)
                observability.record_error(e, {"operation": operation_name})
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                observability.monitor_performance(operation_name, duration)
                return result
            except Exception as e:
                duration = time.time() - start_time
                observability.monitor_performance(operation_name, duration)
                observability.record_error(e, {"operation": operation_name})
                raise
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

def track_business_event(event_type: str):
    """Decorator to track business events"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                result = await func(*args, **kwargs)
                observability.track_business_metric(event_type, status="success")
                return result
            except Exception as e:
                observability.track_business_metric(event_type, status="error")
                observability.record_error(e, {"event_type": event_type})
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                observability.track_business_metric(event_type, status="success")
                return result
            except Exception as e:
                observability.track_business_metric(event_type, status="error")
                observability.record_error(e, {"event_type": event_type})
                raise
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

# Global observability instance
observability = ObservabilityManager() 