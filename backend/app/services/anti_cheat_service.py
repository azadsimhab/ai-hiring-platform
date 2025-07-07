"""
Anti-Cheat Service for Coding Tests
Advanced cheating detection and prevention
"""

import time
import hashlib
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio

# Optional Google Cloud imports
try:
    from google.cloud import monitoring_v3
    from google.cloud import logging as cloud_logging
    GOOGLE_CLOUD_AVAILABLE = True
except ImportError:
    GOOGLE_CLOUD_AVAILABLE = False
    monitoring_v3 = None
    cloud_logging = None

from app.core.config import settings

logger = logging.getLogger(__name__)

class AntiCheatService:
    def __init__(self):
        self.suspicious_sessions = {}
        self.cheating_patterns = {
            "copy_paste": [
                "ctrl+v", "cmd+v", "paste", "copy",
                "clipboard", "select all", "ctrl+a"
            ],
            "external_sites": [
                "stackoverflow", "github", "leetcode",
                "hackerrank", "geeksforgeeks", "w3schools"
            ],
            "suspicious_timing": {
                "min_time_per_character": 0.01,  # seconds
                "max_time_per_character": 0.5,   # seconds
                "suspicious_gaps": 30,           # seconds
            }
        }
        
        # Initialize monitoring (only in production with Google Cloud available)
        self.monitoring_client = None
        self.logging_client = None
        
        if settings.ENVIRONMENT == "production" and GOOGLE_CLOUD_AVAILABLE:
            try:
                self.monitoring_client = monitoring_v3.MetricServiceClient()
                self.logging_client = cloud_logging.Client()
            except Exception as e:
                logger.warning(f"Failed to initialize Google Cloud monitoring: {e}")
    
    async def monitor_coding_session(self, session_id: str, user_id: int, 
                                   challenge_id: int) -> Dict[str, Any]:
        """Monitor a coding test session for cheating"""
        try:
            session_data = {
                "session_id": session_id,
                "user_id": user_id,
                "challenge_id": challenge_id,
                "start_time": datetime.utcnow(),
                "events": [],
                "risk_score": 0,
                "flags": [],
                "screenshots": [],
                "keyboard_events": [],
                "mouse_events": [],
                "focus_events": [],
                "network_requests": [],
            }
            
            self.suspicious_sessions[session_id] = session_data
            
            # Start monitoring tasks
            monitoring_tasks = [
                self._monitor_keyboard_activity(session_id),
                self._monitor_mouse_activity(session_id),
                self._monitor_focus_changes(session_id),
                self._monitor_network_activity(session_id),
                self._monitor_timing_patterns(session_id),
                self._monitor_code_submissions(session_id),
            ]
            
            # Run monitoring tasks concurrently
            await asyncio.gather(*monitoring_tasks, return_exceptions=True)
            
            return session_data
            
        except Exception as e:
            logger.error(f"Error monitoring coding session: {e}")
            return {}
    
    async def _monitor_keyboard_activity(self, session_id: str):
        """Monitor keyboard activity for suspicious patterns"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return
            
            # Simulate keyboard monitoring
            while True:
                await asyncio.sleep(1)
                
                # Check for copy-paste patterns
                keyboard_events = session.get("keyboard_events", [])
                if len(keyboard_events) > 0:
                    recent_events = keyboard_events[-10:]  # Last 10 events
                    
                    # Check for rapid paste operations
                    paste_count = sum(1 for event in recent_events 
                                    if "paste" in event.get("type", "").lower())
                    
                    if paste_count > 3:
                        self._flag_suspicious_activity(session_id, "excessive_paste_operations")
                
        except Exception as e:
            logger.error(f"Keyboard monitoring error: {e}")
    
    async def _monitor_mouse_activity(self, session_id: str):
        """Monitor mouse activity for suspicious patterns"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return
            
            while True:
                await asyncio.sleep(2)
                
                mouse_events = session.get("mouse_events", [])
                if len(mouse_events) > 0:
                    # Check for unusual mouse patterns
                    recent_events = mouse_events[-20:]
                    
                    # Check for rapid clicking (possible automation)
                    click_events = [e for e in recent_events if e.get("type") == "click"]
                    if len(click_events) > 10:
                        time_span = click_events[-1]["timestamp"] - click_events[0]["timestamp"]
                        if time_span < 5:  # 10+ clicks in 5 seconds
                            self._flag_suspicious_activity(session_id, "rapid_mouse_clicks")
                
        except Exception as e:
            logger.error(f"Mouse monitoring error: {e}")
    
    async def _monitor_focus_changes(self, session_id: str):
        """Monitor focus changes (tab switching, window switching)"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return
            
            while True:
                await asyncio.sleep(1)
                
                focus_events = session.get("focus_events", [])
                if len(focus_events) > 0:
                    recent_events = focus_events[-10:]
                    
                    # Check for frequent focus changes
                    focus_changes = [e for e in recent_events if e.get("type") == "blur"]
                    if len(focus_changes) > 5:
                        self._flag_suspicious_activity(session_id, "frequent_focus_changes")
                
        except Exception as e:
            logger.error(f"Focus monitoring error: {e}")
    
    async def _monitor_network_activity(self, session_id: str):
        """Monitor network requests for external resources"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return
            
            while True:
                await asyncio.sleep(5)
                
                network_requests = session.get("network_requests", [])
                if len(network_requests) > 0:
                    # Check for requests to suspicious domains
                    for request in network_requests:
                        url = request.get("url", "").lower()
                        for pattern in self.cheating_patterns["external_sites"]:
                            if pattern in url:
                                self._flag_suspicious_activity(session_id, f"external_site_access_{pattern}")
                
        except Exception as e:
            logger.error(f"Network monitoring error: {e}")
    
    async def _monitor_timing_patterns(self, session_id: str):
        """Monitor timing patterns for suspicious behavior"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return
            
            while True:
                await asyncio.sleep(10)
                
                # Check for suspicious timing gaps
                events = session.get("events", [])
                if len(events) > 1:
                    for i in range(1, len(events)):
                        time_diff = events[i]["timestamp"] - events[i-1]["timestamp"]
                        if time_diff > self.cheating_patterns["suspicious_timing"]["suspicious_gaps"]:
                            self._flag_suspicious_activity(session_id, "suspicious_timing_gap")
                
        except Exception as e:
            logger.error(f"Timing monitoring error: {e}")
    
    async def _monitor_code_submissions(self, session_id: str):
        """Monitor code submissions for plagiarism"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return
            
            while True:
                await asyncio.sleep(30)
                
                # Check for code similarity with previous submissions
                submissions = session.get("code_submissions", [])
                if len(submissions) > 1:
                    similarity_score = self._calculate_code_similarity(submissions)
                    if similarity_score > 0.9:  # 90% similarity
                        self._flag_suspicious_activity(session_id, "high_code_similarity")
                
        except Exception as e:
            logger.error(f"Code submission monitoring error: {e}")
    
    def _flag_suspicious_activity(self, session_id: str, activity_type: str):
        """Flag suspicious activity in the session"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return
            
            flag = {
                "type": activity_type,
                "timestamp": datetime.utcnow().isoformat(),
                "severity": self._get_activity_severity(activity_type),
            }
            
            session["flags"].append(flag)
            session["risk_score"] += self._get_activity_risk_score(activity_type)
            
            # Log suspicious activity
            logger.warning(f"Suspicious activity detected in session {session_id}: {activity_type}")
            
            # Send alert if risk score is high
            if session["risk_score"] > 50:
                self._send_cheating_alert(session_id, activity_type)
                
        except Exception as e:
            logger.error(f"Error flagging suspicious activity: {e}")
    
    def _get_activity_severity(self, activity_type: str) -> str:
        """Get severity level for activity type"""
        high_severity = [
            "external_site_access_github",
            "external_site_access_stackoverflow",
            "high_code_similarity",
            "excessive_paste_operations"
        ]
        
        medium_severity = [
            "frequent_focus_changes",
            "rapid_mouse_clicks",
            "suspicious_timing_gap"
        ]
        
        if activity_type in high_severity:
            return "high"
        elif activity_type in medium_severity:
            return "medium"
        else:
            return "low"
    
    def _get_activity_risk_score(self, activity_type: str) -> int:
        """Get risk score for activity type"""
        risk_scores = {
            "external_site_access_github": 20,
            "external_site_access_stackoverflow": 15,
            "high_code_similarity": 25,
            "excessive_paste_operations": 10,
            "frequent_focus_changes": 8,
            "rapid_mouse_clicks": 5,
            "suspicious_timing_gap": 12,
        }
        
        return risk_scores.get(activity_type, 5)
    
    def _calculate_code_similarity(self, submissions: List[Dict]) -> float:
        """Calculate similarity between code submissions"""
        try:
            if len(submissions) < 2:
                return 0.0
            
            # Simple similarity calculation (implement more sophisticated algorithm)
            code1 = submissions[-1].get("code", "")
            code2 = submissions[-2].get("code", "")
            
            # Remove whitespace and comments for comparison
            code1_clean = self._clean_code_for_comparison(code1)
            code2_clean = self._clean_code_for_comparison(code2)
            
            # Calculate similarity using character-level comparison
            if len(code1_clean) == 0 or len(code2_clean) == 0:
                return 0.0
            
            common_chars = sum(1 for c1, c2 in zip(code1_clean, code2_clean) if c1 == c2)
            total_chars = max(len(code1_clean), len(code2_clean))
            
            return common_chars / total_chars
            
        except Exception as e:
            logger.error(f"Error calculating code similarity: {e}")
            return 0.0
    
    def _clean_code_for_comparison(self, code: str) -> str:
        """Clean code for similarity comparison"""
        try:
            # Remove comments, whitespace, and normalize
            lines = code.split('\n')
            cleaned_lines = []
            
            for line in lines:
                # Remove comments
                if '#' in line:
                    line = line.split('#')[0]
                if '//' in line:
                    line = line.split('//')[0]
                
                # Remove leading/trailing whitespace
                line = line.strip()
                
                if line:
                    cleaned_lines.append(line)
            
            return ''.join(cleaned_lines)
            
        except Exception as e:
            logger.error(f"Error cleaning code: {e}")
            return code
    
    def _send_cheating_alert(self, session_id: str, activity_type: str):
        """Send cheating alert to administrators"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return
            
            alert_data = {
                "session_id": session_id,
                "user_id": session.get("user_id"),
                "challenge_id": session.get("challenge_id"),
                "activity_type": activity_type,
                "risk_score": session.get("risk_score"),
                "timestamp": datetime.utcnow().isoformat(),
                "flags": session.get("flags", []),
            }
            
            # Log alert
            logger.critical(f"CHEATING ALERT: {alert_data}")
            
            # Send to monitoring system in production
            if settings.ENVIRONMENT == "production":
                self._send_to_monitoring(alert_data)
                
        except Exception as e:
            logger.error(f"Error sending cheating alert: {e}")
    
    def _send_to_monitoring(self, alert_data: Dict[str, Any]):
        """Send alert to Google Cloud Monitoring"""
        try:
            # Create custom metric
            series = monitoring_v3.TimeSeries()
            series.metric.type = "custom.googleapis.com/cheating_alert"
            series.resource.type = "global"
            series.resource.labels["project_id"] = settings.GCP_PROJECT_ID
            
            # Add metric labels
            series.metric.labels["session_id"] = alert_data["session_id"]
            series.metric.labels["activity_type"] = alert_data["activity_type"]
            series.metric.labels["risk_score"] = str(alert_data["risk_score"])
            
            # Set metric value
            point = monitoring_v3.Point()
            point.value.double_value = alert_data["risk_score"]
            point.interval.end_time.seconds = int(time.time())
            series.points = [point]
            
            # Write the time series
            self.monitoring_client.create_time_series(
                request={
                    "name": self.monitoring_client.common_project_path(settings.GCP_PROJECT_ID),
                    "time_series": [series],
                }
            )
            
        except Exception as e:
            logger.error(f"Error sending to monitoring: {e}")
    
    def get_session_report(self, session_id: str) -> Dict[str, Any]:
        """Get comprehensive anti-cheat report for a session"""
        try:
            session = self.suspicious_sessions.get(session_id)
            if not session:
                return {}
            
            return {
                "session_id": session_id,
                "user_id": session.get("user_id"),
                "challenge_id": session.get("challenge_id"),
                "start_time": session.get("start_time").isoformat(),
                "end_time": datetime.utcnow().isoformat(),
                "risk_score": session.get("risk_score"),
                "flags": session.get("flags"),
                "total_events": len(session.get("events", [])),
                "suspicious_activities": len(session.get("flags", [])),
                "recommendation": self._get_recommendation(session.get("risk_score")),
            }
            
        except Exception as e:
            logger.error(f"Error generating session report: {e}")
            return {}
    
    def _get_recommendation(self, risk_score: int) -> str:
        """Get recommendation based on risk score"""
        if risk_score >= 80:
            return "HIGH_RISK - Immediate investigation required"
        elif risk_score >= 50:
            return "MEDIUM_RISK - Manual review recommended"
        elif risk_score >= 20:
            return "LOW_RISK - Monitor closely"
        else:
            return "SAFE - No concerns detected"

# Global anti-cheat service instance
anti_cheat_service = AntiCheatService() 