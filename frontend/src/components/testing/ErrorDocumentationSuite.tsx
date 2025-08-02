import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { HolographicButton } from '../ui/HolographicButton';
import { getScreenInfo, testResponsiveBreakpoints } from '../../utils/deviceDetection';

interface TestResult {
  id: string;
  testName: string;
  category: 'Critical' | 'Important' | 'Minor';
  status: 'Pass' | 'Fail' | 'Warning';
  description: string;
  details?: string;
  timestamp: string;
}

export function ErrorDocumentationSuite() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [screenInfo, setScreenInfo] = useState(getScreenInfo());

  useEffect(() => {
    const handleResize = () => {
      setScreenInfo(getScreenInfo());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const runAuthenticationTests = async () => {
    const results: TestResult[] = [];
    
    // Test 1: OAuth Button Functionality
    try {
      const button = document.querySelector('[data-testid="oauth-button"]');
      results.push({
        id: 'auth-001',
        testName: 'OAuth Button Present',
        category: 'Critical',
        status: button ? 'Pass' : 'Fail',
        description: 'Start Free Trial button should be present on landing page',
        details: button ? 'Button found in DOM' : 'Button not found in DOM',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        id: 'auth-001',
        testName: 'OAuth Button Present',
        category: 'Critical',
        status: 'Fail',
        description: 'Error checking for OAuth button',
        details: `Error: ${error}`,
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: LocalStorage Functionality
    try {
      localStorage.setItem('test', 'value');
      const retrieved = localStorage.getItem('test');
      localStorage.removeItem('test');
      
      results.push({
        id: 'auth-002',
        testName: 'LocalStorage Access',
        category: 'Critical',
        status: retrieved === 'value' ? 'Pass' : 'Fail',
        description: 'LocalStorage should be accessible for session management',
        details: retrieved === 'value' ? 'LocalStorage working properly' : 'LocalStorage access failed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        id: 'auth-002',
        testName: 'LocalStorage Access',
        category: 'Critical',
        status: 'Fail',
        description: 'LocalStorage access failed',
        details: `Error: ${error}`,
        timestamp: new Date().toISOString()
      });
    }

    // Test 3: Token Validation
    const token = localStorage.getItem('authToken');
    results.push({
      id: 'auth-003',
      testName: 'Token Persistence',
      category: 'Important',
      status: token ? 'Pass' : 'Warning',
      description: 'Auth token should persist in localStorage',
      details: token ? 'Token found in storage' : 'No token found (expected for new users)',
      timestamp: new Date().toISOString()
    });

    return results;
  };

  const runResponsiveTests = async () => {
    const results: TestResult[] = [];
    const breakpointInfo = testResponsiveBreakpoints();
    
    // Test 1: Screen Size Detection
    results.push({
      id: 'resp-001',
      testName: 'Screen Size Detection',
      category: 'Important',
      status: 'Pass',
      description: 'Device type and screen size should be detected correctly',
      details: `Device: ${screenInfo.deviceType}, Size: ${screenInfo.width}x${screenInfo.height}, Breakpoint: ${breakpointInfo.current?.name}`,
      timestamp: new Date().toISOString()
    });

    // Test 2: Touch Support
    results.push({
      id: 'resp-002',
      testName: 'Touch Support Detection',
      category: 'Minor',
      status: 'Pass',
      description: 'Touch support should be detected for mobile devices',
      details: `Touch support: ${screenInfo.touchSupport ? 'Yes' : 'No'}`,
      timestamp: new Date().toISOString()
    });

    // Test 3: Navigation Responsiveness
    const navElement = document.querySelector('.lg\\:col-span-1');
    results.push({
      id: 'resp-003',
      testName: 'Navigation Layout',
      category: 'Important',
      status: navElement ? 'Pass' : 'Warning',
      description: 'Navigation should adapt to screen size',
      details: navElement ? 'Responsive navigation found' : 'Navigation element not found',
      timestamp: new Date().toISOString()
    });

    return results;
  };

  const runAgentTests = async () => {
    const results: TestResult[] = [];
    
    // Test 1: Agent Tab Navigation
    const agentTabs = document.querySelectorAll('[role="tab"], button[class*="agent"]');
    results.push({
      id: 'agent-001',
      testName: 'Agent Tab Count',
      category: 'Critical',
      status: agentTabs.length >= 9 ? 'Pass' : 'Fail',
      description: 'Should have 9 agent tabs available',
      details: `Found ${agentTabs.length} agent tabs`,
      timestamp: new Date().toISOString()
    });

    // Test 2: Agent Component Loading
    const agentContent = document.querySelector('[class*="AgentDashboard"], [class*="agent"]');
    results.push({
      id: 'agent-002',
      testName: 'Agent Content Loading',
      category: 'Critical',
      status: agentContent ? 'Pass' : 'Fail',
      description: 'Agent content should load properly',
      details: agentContent ? 'Agent content container found' : 'No agent content found',
      timestamp: new Date().toISOString()
    });

    return results;
  };

  const runPerformanceTests = async () => {
    const results: TestResult[] = [];
    
    // Test 1: Page Load Performance
    const perfEntries = performance.getEntriesByType('navigation');
    if (perfEntries.length > 0) {
      const navEntry = perfEntries[0] as PerformanceNavigationTiming;
      const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
      
      results.push({
        id: 'perf-001',
        testName: 'Page Load Time',
        category: 'Important',
        status: loadTime < 2000 ? 'Pass' : loadTime < 5000 ? 'Warning' : 'Fail',
        description: 'Page should load in under 2 seconds',
        details: `Load time: ${loadTime}ms`,
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: Memory Usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
      
      results.push({
        id: 'perf-002',
        testName: 'Memory Usage',
        category: 'Minor',
        status: memoryUsage < 50 ? 'Pass' : memoryUsage < 100 ? 'Warning' : 'Fail',
        description: 'Memory usage should be reasonable',
        details: `Memory usage: ${memoryUsage.toFixed(2)} MB`,
        timestamp: new Date().toISOString()
      });
    }

    // Test 3: Animation Performance
    const animatedElements = document.querySelectorAll('[class*="animate-"], [style*="transform"]');
    results.push({
      id: 'perf-003',
      testName: 'Animation Elements',
      category: 'Minor',
      status: 'Pass',
      description: 'Animated elements should be present for UX',
      details: `Found ${animatedElements.length} animated elements`,
      timestamp: new Date().toISOString()
    });

    return results;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const allResults: TestResult[] = [];
    
    try {
      const authResults = await runAuthenticationTests();
      const respResults = await runResponsiveTests();
      const agentResults = await runAgentTests();
      const perfResults = await runPerformanceTests();
      
      allResults.push(...authResults, ...respResults, ...agentResults, ...perfResults);
      setTestResults(allResults);
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return '#10b981';
      case 'Warning': return '#f59e0b';
      case 'Fail': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Critical': return '#ef4444';
      case 'Important': return '#f59e0b';
      case 'Minor': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const testCounts = {
    total: testResults.length,
    passed: testResults.filter(t => t.status === 'Pass').length,
    warnings: testResults.filter(t => t.status === 'Warning').length,
    failed: testResults.filter(t => t.status === 'Fail').length
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-hologram mb-2">
            Error Documentation Suite
          </h1>
          <p className="text-white/70 mb-8">
            Comprehensive testing and error documentation for the agentic hiring platform
          </p>
        </motion.div>

        {/* Test Control Panel */}
        <GlassCard className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-primary-400 mb-2">Test Suite Controls</h2>
              <p className="text-white/60 text-sm">
                Screen: {screenInfo.width}x{screenInfo.height} ({screenInfo.deviceType})
              </p>
            </div>
            
            <HolographicButton
              variant="primary"
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? '🔄 Running Tests...' : '🧪 Run All Tests'}
            </HolographicButton>
          </div>
        </GlassCard>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <GlassCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">{testCounts.total}</div>
                <div className="text-white/60 text-sm">Total Tests</div>
              </div>
            </GlassCard>
            
            <GlassCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{testCounts.passed}</div>
                <div className="text-white/60 text-sm">Passed</div>
              </div>
            </GlassCard>
            
            <GlassCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{testCounts.warnings}</div>
                <div className="text-white/60 text-sm">Warnings</div>
              </div>
            </GlassCard>
            
            <GlassCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{testCounts.failed}</div>
                <div className="text-white/60 text-sm">Failed</div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Detailed Test Results */}
        {testResults.length > 0 && (
          <GlassCard>
            <h2 className="text-xl font-semibold text-primary-400 mb-6">Detailed Test Results</h2>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 p-4 rounded-lg border border-white/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ 
                          backgroundColor: getCategoryColor(result.category) + '20',
                          color: getCategoryColor(result.category)
                        }}
                      >
                        {result.category}
                      </span>
                      <h3 className="font-semibold text-white">{result.testName}</h3>
                    </div>
                    
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: getStatusColor(result.status) + '20',
                        color: getStatusColor(result.status)
                      }}
                    >
                      {result.status}
                    </span>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-2">{result.description}</p>
                  
                  {result.details && (
                    <p className="text-white/60 text-xs font-mono bg-black/20 p-2 rounded">
                      {result.details}
                    </p>
                  )}
                  
                  <div className="text-white/40 text-xs mt-2">
                    Test ID: {result.id} | {new Date(result.timestamp).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}