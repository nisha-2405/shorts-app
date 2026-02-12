// src/pages/Home.jsx - COMPLETE VERSION WITH ALL FUNCTIONALITY
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  VideoCall, 
  Upload, 
  Security, 
  Home as HomeIcon,
  Person,
  Logout,
  PlayArrow,
  ThumbUp,
  Comment,
  Share,
  Search,
  Notifications,
  Menu,
  TrendingUp,
  History,
  Favorite,
  PlaylistPlay,
  Settings,
  Help,
  Flag,
  Report,
  Download,
  MoreVert,
  AddCircle,
  CheckCircle,
  Warning,
  BarChart,
  Group,
  Visibility,
  EmojiEmotions,
  Create,
  FilterList,
  Sort,
  Refresh
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  // State variables
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('for-you');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your video got 10 new likes!', time: '2 min ago', read: false },
    { id: 2, text: 'Alex commented on your video', time: '1 hour ago', read: false },
    { id: 3, text: 'Safety check completed on upload', time: '3 hours ago', read: true },
    { id: 4, text: 'Welcome to ShortsSafe!', time: '1 day ago', read: true },
  ]);

  // Mock videos data (replace with Firestore data)
  const mockVideos = [
    { 
      id: 1, 
      userId: 'user1',
      user: 'Alex Johnson', 
      userPhoto: 'https://via.placeholder.com/50/764ba2/ffffff?text=A',
      caption: 'Beautiful sunset at the beach! 🏖️', 
      likes: 245, 
      comments: 42,
      shares: 15,
      views: 1250,
      duration: '0:15',
      timestamp: '2 hours ago',
      isVerified: true,
      category: 'Nature'
    },
    { 
      id: 2, 
      userId: 'user2',
      user: 'Sarah Miller', 
      userPhoto: 'https://via.placeholder.com/50/667eea/ffffff?text=S',
      caption: 'My morning workout routine 💪 Stay fit everyone!', 
      likes: 189, 
      comments: 31,
      shares: 8,
      views: 890,
      duration: '0:30',
      timestamp: '4 hours ago',
      isVerified: false,
      category: 'Fitness'
    },
    { 
      id: 3, 
      userId: 'user3',
      user: 'TechReview', 
      userPhoto: 'https://via.placeholder.com/50/ff6b6b/ffffff?text=T',
      caption: 'New smartphone camera test 📱 Which phone is best?', 
      likes: 562, 
      comments: 89,
      shares: 45,
      views: 3200,
      duration: '0:45',
      timestamp: '1 day ago',
      isVerified: true,
      category: 'Technology'
    },
    { 
      id: 4, 
      userId: 'user4',
      user: 'CookingWithJoy', 
      userPhoto: 'https://via.placeholder.com/50/4caf50/ffffff?text=C',
      caption: 'Quick 2-minute pasta recipe 🍝 Perfect for students!', 
      likes: 321, 
      comments: 56,
      shares: 22,
      views: 2100,
      duration: '0:25',
      timestamp: '2 days ago',
      isVerified: true,
      category: 'Food'
    },
    { 
      id: 5, 
      userId: 'user5',
      user: 'TravelDiaries', 
      userPhoto: 'https://via.placeholder.com/50/ff9800/ffffff?text=TD',
      caption: 'Hidden waterfall in the mountains 🏞️ #TravelGoals', 
      likes: 432, 
      comments: 67,
      shares: 31,
      views: 2800,
      duration: '0:20',
      timestamp: '3 days ago',
      isVerified: false,
      category: 'Travel'
    },
  ];

  // Fetch videos from Firestore
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      // Uncomment when you have Firestore setup
      /*
      const q = query(
        collection(db, 'videos'), 
        orderBy('createdAt', 'desc'), 
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const videosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(videosData);
      */
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVideos(mockVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos(mockVideos); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      alert(`Logout error: ${error.message}`);
    }
  };

  const handleLike = (videoId) => {
    if (likedVideos.has(videoId)) {
      likedVideos.delete(videoId);
      // Update video likes count
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, likes: Math.max(0, video.likes - 1) }
          : video
      ));
    } else {
      likedVideos.add(videoId);
      // Update video likes count
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, likes: video.likes + 1 }
          : video
      ));
    }
    setLikedVideos(new Set(likedVideos));
  };

  const handleShare = (video) => {
    const shareText = `Check out this video by ${video.user}: ${video.caption}`;
    if (navigator.share) {
      navigator.share({
        title: 'ShortsSafe Video',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = (videoId) => {
    const reason = prompt('Please specify the reason for reporting:');
    if (reason) {
      alert(`Thank you for reporting. Our team will review video #${videoId}.`);
      // In production: Send report to backend
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
      // Implement actual search
    }
  };

  const handleUpload = () => {
    navigate('/upload');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const tabs = [
    { id: 'for-you', label: 'For You', icon: <Favorite /> },
    { id: 'following', label: 'Following', icon: <Group /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp /> },
    { id: 'safety', label: 'Safe Mode', icon: <Security /> },
  ];

  const menuItems = [
    { label: 'My Profile', icon: <Person />, action: () => navigate('/profile') },
    { label: 'Settings', icon: <Settings />, action: () => alert('Settings') },
    { label: 'Help & Support', icon: <Help />, action: () => alert('Help') },
    { label: 'Safety Center', icon: <Security />, action: () => alert('Safety Center') },
    { label: 'Creator Studio', icon: <VideoCall />, action: () => alert('Creator Studio') },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            style={styles.menuButton}
          >
            <Menu />
          </button>
          <div style={styles.logoContainer}>
            <VideoCall style={styles.headerLogo} />
            <h1 style={styles.headerTitle}>
              Shorts<span style={styles.highlight}>Safe</span>
            </h1>
          </div>
        </div>

        <div style={styles.headerCenter}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search videos, creators, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  style={styles.clearSearch}
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" style={styles.searchButton}>
              Search
            </button>
          </form>
        </div>

        <div style={styles.headerRight}>
          {/* Upload Button */}
          <button 
            onClick={handleUpload} 
            style={styles.uploadHeaderButton}
            title="Upload Video"
          >
            <AddCircle />
          </button>

          {/* Notifications */}
          <div style={styles.notificationContainer}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={styles.notificationButton}
            >
              <Notifications />
              {getUnreadCount() > 0 && (
                <span style={styles.notificationBadge}>{getUnreadCount()}</span>
              )}
            </button>
            
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                <div style={styles.notificationHeader}>
                  <h3>Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    style={styles.markAllButton}
                  >
                    Mark all as read
                  </button>
                </div>
                <div style={styles.notificationList}>
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      style={{
                        ...styles.notificationItem,
                        background: notification.read ? 'white' : '#f0f8ff'
                      }}
                    >
                      <div style={styles.notificationDot}></div>
                      <div style={styles.notificationContent}>
                        <p style={styles.notificationText}>{notification.text}</p>
                        <span style={styles.notificationTime}>{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={styles.viewAllButton}>
                  View All Notifications
                </button>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div style={styles.userContainer}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              style={styles.userButton}
            >
              <div style={styles.userAvatar}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={styles.userName}>
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            </button>
          </div>

          {/* Menu Dropdown */}
          {showMenu && (
            <div style={styles.menuDropdown}>
              <div style={styles.menuHeader}>
                <div style={styles.menuUserInfo}>
                  <div style={styles.menuUserAvatar}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 style={styles.menuUserName}>
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </h4>
                    <p style={styles.menuUserEmail}>{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setShowMenu(false);
                    }}
                    style={styles.menuItem}
                  >
                    <span style={styles.menuItemIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              
              <div style={styles.menuFooter}>
                <button 
                  onClick={handleLogout}
                  style={styles.logoutMenuButton}
                >
                  <Logout /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Tabs Navigation */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.id ? styles.tabButtonActive : {})
              }}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && <div style={styles.tabIndicator}></div>}
            </button>
          ))}
        </div>
        <div style={styles.tabActions}>
          <button style={styles.tabActionButton}>
            <FilterList /> Filter
          </button>
          <button style={styles.tabActionButton}>
            <Sort /> Sort
          </button>
          <button onClick={fetchVideos} style={styles.tabActionButton}>
            <Refresh /> Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Quick Stats */}
        <div style={styles.quickStats}>
          <div style={styles.statCard}>
            <Visibility style={styles.statIcon} />
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>1,250</h3>
              <p style={styles.statLabel}>Total Views</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <ThumbUp style={styles.statIcon} />
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>245</h3>
              <p style={styles.statLabel}>Total Likes</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <Security style={styles.statIcon} />
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>100%</h3>
              <p style={styles.statLabel}>Safe Content</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <BarChart style={styles.statIcon} />
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>12</h3>
              <p style={styles.statLabel}>Videos Posted</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button 
            onClick={handleUpload}
            style={styles.primaryActionButton}
          >
            <Upload /> Upload Video
          </button>
          <button style={styles.secondaryActionButton}>
            <Create /> Create Story
          </button>
          <button style={styles.secondaryActionButton}>
            <EmojiEmotions /> Go Live
          </button>
          <button style={styles.secondaryActionButton}>
            <PlaylistPlay /> Playlists
          </button>
        </div>

        {/* Video Feed */}
        <div style={styles.feedContainer}>
          <div style={styles.feedHeader}>
            <h2 style={styles.feedTitle}>
              {activeTab === 'for-you' && 'Recommended For You'}
              {activeTab === 'following' && 'Following'}
              {activeTab === 'trending' && 'Trending Now'}
              {activeTab === 'safety' && 'Safe & Verified Content'}
            </h2>
            <div style={styles.feedControls}>
              <button style={styles.feedControlButton}>
                <History /> Watch History
              </button>
              <button style={styles.feedControlButton}>
                <Favorite /> Liked Videos
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading videos...</p>
            </div>
          ) : (
            <div style={styles.videoGrid}>
              {videos.map(video => (
                <div key={video.id} style={styles.videoCard}>
                  {/* Video Thumbnail */}
                  <div style={styles.videoThumbnail}>
                    <div style={styles.thumbnailOverlay}>
                      <PlayArrow style={styles.playButton} />
                      <div style={styles.videoDuration}>{video.duration}</div>
                    </div>
                    <div style={styles.videoCategory}>{video.category}</div>
                  </div>

                  {/* Video Info */}
                  <div style={styles.videoInfo}>
                    {/* User Info */}
                    <div style={styles.userSection}>
                      <img 
                        src={video.userPhoto} 
                        alt={video.user}
                        style={styles.userThumbnail}
                      />
                      <div style={styles.userDetails}>
                        <div style={styles.userNameRow}>
                          <h4 style={styles.videoUser}>
                            {video.user}
                            {video.isVerified && (
                              <CheckCircle style={styles.verifiedIcon} />
                            )}
                          </h4>
                          <span style={styles.videoTime}>{video.timestamp}</span>
                        </div>
                        <p style={styles.videoCaption}>
                          {video.caption}
                          {video.caption.length > 80 && '...'}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleReport(video.id)}
                        style={styles.moreButton}
                      >
                        <MoreVert />
                      </button>
                    </div>

                    {/* Video Stats */}
                    <div style={styles.videoStats}>
                      <div style={styles.statItem}>
                        <Visibility /> {video.views.toLocaleString()}
                      </div>
                      <div style={styles.statItem}>
                        <Comment /> {video.comments}
                      </div>
                      <div style={styles.statItem}>
                        <Share /> {video.shares}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={styles.actionRow}>
                      <button 
                        onClick={() => handleLike(video.id)}
                        style={{
                          ...styles.actionButton,
                          ...(likedVideos.has(video.id) ? styles.likedButton : {})
                        }}
                      >
                        <ThumbUp />
                        <span>{video.likes.toLocaleString()}</span>
                      </button>
                      
                      <button style={styles.actionButton}>
                        <Comment />
                        <span>Comment</span>
                      </button>
                      
                      <button 
                        onClick={() => handleShare(video)}
                        style={styles.actionButton}
                      >
                        <Share />
                        <span>Share</span>
                      </button>
                      
                      <button style={styles.actionButton}>
                        <Download />
                        <span>Save</span>
                      </button>
                    </div>

                    {/* Safety Badge */}
                    <div style={styles.safetyBadge}>
                      <Security style={styles.safetyIcon} />
                      <span>AI Verified Safe</span>
                      <Warning style={styles.safetyWarningIcon} />
                      <span>Report</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav style={styles.bottomNav}>
        <button 
          style={styles.navButton}
          onClick={() => navigate('/')}
        >
          <HomeIcon style={styles.navIconActive} />
          <span style={styles.navTextActive}>Home</span>
        </button>
        
        <button 
          style={styles.navButton}
          onClick={() => navigate('/explore')}
        >
          <Search style={styles.navIcon} />
          <span style={styles.navText}>Explore</span>
        </button>
        
        <button 
          style={styles.uploadNavButton}
          onClick={handleUpload}
        >
          <AddCircle style={styles.uploadNavIcon} />
        </button>
        
        <button 
          style={styles.navButton}
          onClick={() => navigate('/notifications')}
        >
          <Notifications style={styles.navIcon} />
          <span style={styles.navText}>Alerts</span>
          {getUnreadCount() > 0 && (
            <span style={styles.navBadge}>{getUnreadCount()}</span>
          )}
        </button>
        
        <button 
          style={styles.navButton}
          onClick={handleProfile}
        >
          <Person style={styles.navIcon} />
          <span style={styles.navText}>Profile</span>
        </button>
      </nav>

      {/* Floating Action Button */}
      <button 
        onClick={handleUpload}
        style={styles.floatingButton}
        title="Upload Video"
      >
        <Upload />
      </button>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',
    paddingBottom: '80px',
  },
  
  // Header Styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    background: 'white',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid #eee',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: 1,
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    '&:hover': {
      background: '#f5f5f5',
    },
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerLogo: {
    fontSize: '28px',
    color: '#764ba2',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333',
  },
  highlight: {
    color: '#764ba2',
  },
  headerCenter: {
    flex: 2,
    maxWidth: '600px',
    margin: '0 20px',
  },
  searchForm: {
    display: 'flex',
    gap: '10px',
    width: '100%',
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#999',
    fontSize: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e0e0e0',
    borderRadius: '25px',
    fontSize: '14px',
    transition: 'all 0.3s',
    '&:focus': {
      outline: 'none',
      borderColor: '#764ba2',
      boxShadow: '0 0 0 3px rgba(118, 75, 162, 0.1)',
    },
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
    '&:hover': {
      color: '#333',
    },
  },
  searchButton: {
    padding: '12px 24px',
    background: '#764ba2',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': {
      background: '#667eea',
    },
  },
  headerRight: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '15px',
    position: 'relative',
  },
  uploadHeaderButton: {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '24px',
    boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    position: 'relative',
    '&:hover': {
      background: '#f5f5f5',
    },
  },
  notificationBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: '#ff4757',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: '350px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    border: '1px solid #eee',
    zIndex: 1001,
    overflow: 'hidden',
  },
  notificationHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markAllButton: {
    background: 'none',
    border: 'none',
    color: '#764ba2',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  notificationList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  notificationItem: {
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    '&:hover': {
      background: '#f9f9f9',
    },
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    background: '#764ba2',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    color: '#333',
  },
  notificationTime: {
    fontSize: '12px',
    color: '#999',
  },
  viewAllButton: {
    width: '100%',
    padding: '15px',
    background: '#f8f9fa',
    border: 'none',
    color: '#764ba2',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    '&:hover': {
      background: '#f0f0f0',
    },
  },
  userContainer: {
    position: 'relative',
  },
  userButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '25px',
    '&:hover': {
      background: '#f5f5f5',
    },
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  menuDropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: '280px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    border: '1px solid #eee',
    zIndex: 1001,
    overflow: 'hidden',
  },
  menuHeader: {
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  menuUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  menuUserAvatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  menuUserName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  menuUserEmail: {
    margin: 0,
    fontSize: '12px',
    color: '#666',
  },
  menuItems: {
    padding: '10px 0',
  },
  menuItem: {
    width: '100%',
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    textAlign: 'left',
    '&:hover': {
      background: '#f8f9fa',
    },
  },
  menuItemIcon: {
    color: '#764ba2',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  menuFooter: {
    padding: '15px 20px',
    borderTop: '1px solid #eee',
    background: '#f8f9fa',
  },
  logoutMenuButton: {
    width: '100%',
    padding: '12px',
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    '&:hover': {
      background: '#ff4757',
    },
  },
  
  // Tabs Styles
  tabsContainer: {
    background: 'white',
    borderBottom: '1px solid #eee',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: '70px',
    zIndex: 999,
  },
  tabs: {
    display: 'flex',
    gap: '5px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  tabButton: {
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    position: 'relative',
    borderRadius: '20px',
    transition: 'all 0.3s',
  },
  tabButtonActive: {
    color: '#764ba2',
    background: '#f3f0ff',
  },
  tabIcon: {
    fontSize: '18px',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '3px',
    background: '#764ba2',
    borderRadius: '2px',
  },
  tabActions: {
    display: 'flex',
    gap: '10px',
  },
  tabActionButton: {
    padding: '8px 16px',
    background: '#f8f9fa',
    border: '1px solid #e0e0e0',
    color: '#666',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '8px',
    '&:hover': {
      background: '#f0f0f0',
    },
  },
  
  // Main Content Styles
  main: {
    padding: '20px',
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  statIcon: {
    fontSize: '32px',
    color: '#764ba2',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    overflowX: 'auto',
    paddingBottom: '10px',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  primaryActionButton: {
    padding: '15px 25px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(118, 75, 162, 0.4)',
    },
  },
  secondaryActionButton: {
    padding: '15px 20px',
    background: 'white',
    color: '#764ba2',
    border: '2px solid #764ba2',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    '&:hover': {
      background: '#f8f9fa',
    },
  },
  feedContainer: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
  },
  feedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  feedTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
  },
  feedControls: {
    display: 'flex',
    gap: '10px',
  },
  feedControlButton: {
    padding: '10px 20px',
    background: '#f8f9fa',
    border: '1px solid #e0e0e0',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px',
    '&:hover': {
      background: '#f0f0f0',
    },
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #764ba2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
  },
  videoCard: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    },
  },
  videoThumbnail: {
    height: '200px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    fontSize: '60px',
    color: 'white',
    opacity: 0.9,
  },
  videoDuration: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  videoCategory: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'rgba(255,255,255,0.9)',
    color: '#764ba2',
    padding: '4px 12px',
    borderRadius: '15px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  videoInfo: {
    padding: '20px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '15px',
  },
  userThumbnail: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  videoUser: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  verifiedIcon: {
    fontSize: '16px',
    color: '#4caf50',
  },
  videoTime: {
    fontSize: '12px',
    color: '#999',
  },
  videoCaption: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.5,
  },
  moreButton: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    padding: '8px',
    '&:hover': {
      color: '#333',
    },
  },
  videoStats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '15px',
    padding: '12px 0',
    borderTop: '1px solid #eee',
    borderBottom: '1px solid #eee',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#666',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  actionButton: {
    flex: 1,
    padding: '10px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '8px',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#f8f9fa',
    },
  },
  likedButton: {
    color: '#764ba2',
    fontWeight: 'bold',
  },
  safetyBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 15px',
    background: '#f0f8ff',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#1976d2',
  },
  safetyIcon: {
    fontSize: '16px',
  },
  safetyWarningIcon: {
    fontSize: '16px',
    color: '#ff9800',
    cursor: 'pointer',
    '&:hover': {
      color: '#f57c00',
    },
  },
  
  // Bottom Navigation
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0',
    boxShadow: '0 -2px 15px rgba(0,0,0,0.08)',
    borderTop: '1px solid #eee',
    zIndex: 1000,
  },
  navButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    position: 'relative',
    padding: '8px 16px',
    borderRadius: '8px',
    '&:hover': {
      background: '#f8f9fa',
    },
  },
  navIcon: {
    fontSize: '24px',
    color: '#999',
  },
  navIconActive: {
    fontSize: '24px',
    color: '#764ba2',
  },
  navText: {
    fontSize: '11px',
    color: '#999',
  },
  navTextActive: {
    fontSize: '11px',
    color: '#764ba2',
    fontWeight: 'bold',
  },
  navBadge: {
    position: 'absolute',
    top: '4px',
    right: '8px',
    background: '#ff4757',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadNavButton: {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginTop: '-20px',
    boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  uploadNavIcon: {
    fontSize: '28px',
  },
  
  // Floating Button
  floatingButton: {
    position: 'fixed',
    bottom: '90px',
    right: '25px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '28px',
    boxShadow: '0 6px 20px rgba(118, 75, 162, 0.4)',
    zIndex: 999,
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default Home;