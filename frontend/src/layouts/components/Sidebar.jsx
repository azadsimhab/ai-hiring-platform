import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  Typography,
  Avatar,
  Tooltip,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  AutoAwesome as AIIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  SwitchVideo as ScreeningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo';

// Constants
const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 80;

// Styled components
const StyledDrawer = styled(Drawer)(({ theme, open, collapsed }) => ({
  width: open ? (collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH) : 0,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
    background: 'rgba(10, 15, 24, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
    overflowX: 'hidden',
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  '&.active .MuiListItemButton-root': {
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, collapsed }) => ({
  minHeight: 48,
  justifyContent: collapsed ? 'center' : 'initial',
  px: 2.5,
  margin: '4px 8px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 0,
  marginRight: 16,
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
}));

/**
 * Sidebar Component
 * 
 * Provides navigation for the application with a futuristic design
 */
const Sidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for collapsible sidebar on desktop
  const [collapsed, setCollapsed] = useState(false);
  
  // State for expandable sections
  const [expandHiring, setExpandHiring] = useState(true);
  
  // Toggle collapsed state (desktop only)
  const toggleCollapsed = () => {
    if (!isMobile) {
      setCollapsed(!collapsed);
    }
  };
  
  // Close sidebar on mobile after navigation
  const handleNavigation = () => {
    if (isMobile) {
      onToggle();
    }
  };
  
  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      title: 'Hiring Process',
      icon: <AssignmentIcon />,
      children: [
        {
          title: 'Hiring Requests',
          icon: <AssignmentIcon fontSize="small" />,
          path: '/hiring-requests',
        },
        {
          title: 'JD Generator',
          icon: <DescriptionIcon fontSize="small" />,
          path: '/job-descriptions',
          highlight: true, // Highlight this as a new feature
        },
        {
          title: 'Resume Scanner',
          icon: <AIIcon fontSize="small" />,
          path: '/resume-scanner',
        },
      ],
    },
    {
      title: 'Interviews',
      icon: <PersonIcon />,
      path: '/interviews',
    },
    {
      title: 'Screening',
      icon: <ScreeningIcon />,
      path: '/screening',
      highlight: true, // New feature highlight
    },
    {
      title: 'Coding Tests',
      icon: <CodeIcon />,
      path: '/coding-tests',
    },
    {
      title: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
    },
  ];
  
  // Drawer content
  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: theme.spacing(2),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {!collapsed && (
          <Logo 
            sx={{ 
              height: 40,
              '& .logo-text': {
                display: 'block',
              }
            }} 
          />
        )}
        
        <IconButton
          onClick={toggleCollapsed}
          sx={{
            color: theme.palette.primary.main,
            background: alpha(theme.palette.primary.main, 0.1),
            borderRadius: '50%',
            padding: '8px',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      
      {/* User profile section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'flex-start',
          padding: theme.spacing(2),
          mb: 1,
        }}
      >
        <Avatar
          src={user?.avatar}
          alt={user?.name}
          sx={{
            width: 48,
            height: 48,
            mb: collapsed ? 0 : 1,
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
          }}
        />
        
        {!collapsed && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role || 'HR Manager'}
            </Typography>
          </>
        )}
      </Box>
      
      <Divider 
        sx={{ 
          borderColor: alpha(theme.palette.primary.main, 0.1),
          '&::before, &::after': {
            borderColor: alpha(theme.palette.primary.main, 0.1),
          }
        }} 
      />
      
      {/* Navigation links */}
      <List component="nav" sx={{ px: 1 }}>
        {navItems.map((item) => {
          // Check if the item has children
          if (item.children) {
            return (
              <React.Fragment key={item.title}>
                <ListItem disablePadding sx={{ display: 'block', mb: 1 }}>
                  <StyledListItemButton
                    onClick={() => setExpandHiring(!expandHiring)}
                    collapsed={collapsed}
                  >
                    <StyledListItemIcon>
                      {item.icon}
                    </StyledListItemIcon>
                    
                    {!collapsed && (
                      <>
                        <ListItemText primary={item.title} />
                        {expandHiring ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </StyledListItemButton>
                </ListItem>
                
                <Collapse in={collapsed ? true : expandHiring} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <StyledNavLink
                        key={child.title}
                        to={child.path}
                        onClick={handleNavigation}
                        end
                      >
                        <Tooltip 
                          title={collapsed ? child.title : ""}
                          placement="right"
                          arrow
                        >
                          <ListItem disablePadding sx={{ display: 'block' }}>
                            <StyledListItemButton
                              sx={{
                                pl: collapsed ? 2 : 4,
                                ...(child.highlight && {
                                  position: 'relative',
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 8,
                                    right: collapsed ? 8 : 16,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.secondary.main,
                                    animation: 'pulse 1.5s infinite',
                                    '@keyframes pulse': {
                                      '0%': {
                                        boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0.7)}`,
                                      },
                                      '70%': {
                                        boxShadow: `0 0 0 6px ${alpha(theme.palette.secondary.main, 0)}`,
                                      },
                                      '100%': {
                                        boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0)}`,
                                      },
                                    },
                                  },
                                }),
                              }}
                              collapsed={collapsed}
                            >
                              <StyledListItemIcon>
                                {child.icon}
                              </StyledListItemIcon>
                              
                              {!collapsed && (
                                <ListItemText 
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      {child.title}
                                      {child.highlight && (
                                        <Box
                                          component={motion.div}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                                          sx={{
                                            ml: 1,
                                            px: 1,
                                            py: 0.2,
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            color: theme.palette.secondary.contrastText,
                                            backgroundColor: theme.palette.secondary.main,
                                            boxShadow: `0 0 10px ${alpha(theme.palette.secondary.main, 0.5)}`,
                                          }}
                                        >
                                          NEW
                                        </Box>
                                      )}
                                    </Box>
                                  }
                                />
                              )}
                            </StyledListItemButton>
                          </ListItem>
                        </Tooltip>
                      </StyledNavLink>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          
          // Regular menu item without children
          return (
            <StyledNavLink
              key={item.title}
              to={item.path}
              onClick={handleNavigation}
              end
            >
              <Tooltip 
                title={collapsed ? item.title : ""}
                placement="right"
                arrow
              >
                <ListItem disablePadding sx={{ display: 'block', mb: 1 }}>
                  <StyledListItemButton collapsed={collapsed}>
                    <StyledListItemIcon>
                      {item.icon}
                    </StyledListItemIcon>
                    
                    {!collapsed && <ListItemText primary={item.title} />}
                  </StyledListItemButton>
                </ListItem>
              </Tooltip>
            </StyledNavLink>
          );
        })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Logout button */}
      <Box sx={{ p: 2 }}>
        <ListItem disablePadding sx={{ display: 'block', mb: 1 }}>
          <StyledListItemButton
            onClick={logout}
            collapsed={collapsed}
            sx={{
              borderRadius: '8px',
              background: alpha(theme.palette.error.main, 0.1),
              '&:hover': {
                background: alpha(theme.palette.error.main, 0.2),
                '& .MuiListItemIcon-root': {
                  color: theme.palette.error.main,
                },
              },
            }}
          >
            <StyledListItemIcon sx={{ color: theme.palette.error.main }}>
              <LogoutIcon />
            </StyledListItemIcon>
            
            {!collapsed && (
              <ListItemText
                primary="Logout"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: theme.palette.error.main,
                  },
                }}
              />
            )}
          </StyledListItemButton>
        </ListItem>
      </Box>
    </>
  );
  
  return (
    <StyledDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      collapsed={collapsed ? 1 : 0}
      onClose={onToggle}
    >
      {drawerContent}
    </StyledDrawer>
  );
};

export default Sidebar;
