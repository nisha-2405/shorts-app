// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  Person,
  Edit,
  Settings,
  Security,
  VideoCall,
  ThumbUp,
  Visibility,
  Group,
  History,
  Bookmark,
  Help,
  Logout,
  ArrowBack,
  CameraAlt,
  CheckCircle,
  Warning,
  TrendingUp,
  BarChart,
  EmojiEvents,
  Share,
  MoreVert
} from '@mui/icons-material';

const Profile = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  const [activeTab, setActiveTab] = useState('videos');
  const [stats, setStats] = useState({
    videos: 0,
    likes: 0,
    views: 0,
    followers: 0,
    following: 0
  });
  
  const [userVideos, setUserVideos] = useState([
    { id: 1, title: 'My First Short', views: 150, likes: 25, date: '2 days ago', thumbnail: 'https://via.placeholder.com/160x280/764ba2/ffffff?text=Video+1' },
    { id: 2, title: 'Weekend Adventure', views: 320, likes: 48, date: '1 week ago', thumbnail: 'https://via.placeholder.com/160x280/667eea/ffffff?text=Video+2' },
    { id: 3, title: 'Cooking Tutorial', views: 540, likes: 89, date: '2 weeks ago', thumbnail: 'https://via.placeholder.com/160x280/ff6b6b/ffffff?text=Video+3' },
    { id: 4, title: 'Workout Routine', views: 210, likes: 32, date: '3 weeks ago', thumbnail: 'https://via.placeholder.com/160x280/4caf50/ffffff?text=Video+4' },
  ]);
  
  const [safetyScore, setSafetyScore] = useState(95); // 0-100
  
  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        videos: 12,
        likes: 456,
        views: 12500,
        followers: 245,
        following: 156
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      alert(`Logout error: ${error.message}`);
    }
  };
  
  const handleEditProfile = () => {
    alert('Edit profile feature would open here');
  };
  
  const tabs = [
    { id: 'videos', label: 'Videos', icon: <VideoCall />, count: stats.videos },
    { id: 'likes', label: 'Likes', icon: <ThumbUp />, count: stats.likes },
    { id: 'history', label: 'History', icon: <History /> },
    { id: 'saved', label: 'Saved', icon: <Bookmark /> },
  ];
  
  const getSafetyLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: '#4caf50', icon: <CheckCircle /> };
    if (score >= 70) return { level: 'Good', color: '#8bc34a', icon: <CheckCircle /> };
    if (score >= 50) return { level: 'Fair', color: '#ffc107', icon: <Warning /> };
    return { level: 'Needs Improvement', color: '#f44336', icon: <Warning /> };
  };
  
  const safety = getSafetyLevel(safetyScore);
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          <ArrowBack /> Back
        </button>
        <h1 style={styles.headerTitle}>My Profile</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <Logout /> Logout
        </button>
      </header>
      
      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div style={styles.avatarSection}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button style={styles.editAvatarButton}>
              <CameraAlt />
            </button>
          </div>
          <div style={styles.profileInfo}>
            <h2 style={styles.userName}>
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
              <CheckCircle style={styles.verifiedBadge} />
            </h2>
            <p style={styles.userEmail}>{user?.email}</p>
            <p style={styles.joinDate}>Joined January 2024</p>
          </div>
        </div>
        
        <div style={styles.actionButtons}>
          <button onClick={handleEditProfile} style={styles.editButton}>
            <Edit /> Edit Profile
          </button>
          <button style={styles.shareButton}>
            <Share /> Share Profile
          </button>
          <button style={styles.settingsButton}>
            <Settings />
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <VideoCall style={styles.statIcon} />
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.videos}</h3>
              <p style={styles.statLabel}>Videos</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <ThumbUp style={styles.statIcon} />
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.likes.toLocaleString()}</h3>
              <p style={styles.statLabel}>Likes</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <Visibility style={styles.statIcon} />
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.views.toLocaleString()}</h3>
              <p style={styles.statLabel}>Views</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <Group style={styles.statIcon} />
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.followers}</h3>
              <p style={styles.statLabel}>Followers</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Safety Score */}
      <div style={styles.safetySection}>
        <div style={styles.safetyHeader}>
          <Security style={styles.safetyIcon} />
          <div>
            <h3 style={styles.safetyTitle}>Safety Score</h3>
            <p style={styles.safetySubtitle}>How safe is your content?</p>
          </div>
          <span style={{ ...styles.safetyLevel, color: safety.color }}>
            {safety.icon} {safety.level}
          </span>
        </div>
        
        <div style={styles.scoreMeter}>
          <div style={styles.scoreLabels}>
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          <div style={styles.meterTrack}>
            <div 
              style={{
                ...styles.meterFill,
                width: `${safetyScore}%`,
                background: `linear-gradient(90deg, ${safety.color} 0%, ${safety.color}99 100%)`
              }}
            ></div>
          </div>
          <div style={styles.scoreValue}>
            <span style={styles.scoreNumber}>{safetyScore}</span>
            <span style={styles.scoreMax}>/100</span>
          </div>
        </div>
        
        <div style={styles.safetyTips}>
          <h4 style={styles.tipsTitle}>💡 Tips to improve your score:</h4>
          <ul style={styles.tipsList}>
            <li>Use respectful language in captions</li>
            <li>Avoid harmful or toxic content</li>
            <li>Report inappropriate comments</li>
            <li>Engage positively with community</li>
          </ul>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={styles.tabsSection}>
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
              {tab.count !== undefined && (
                <span style={styles.tabCount}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div style={styles.contentSection}>
        {activeTab === 'videos' && (
          <div style={styles.videosGrid}>
            {userVideos.map(video => (
              <div key={video.id} style={styles.videoCard}>
                <div style={styles.videoThumbnail}>
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    style={styles.thumbnailImage}
                  />
                  <div style={styles.videoOverlay}>
                    <span style={styles.videoViews}>👁️ {video.views}</span>
                    <span style={styles.videoLikes}>❤️ {video.likes}</span>
                  </div>
                </div>
                <div style={styles.videoInfo}>
                  <h4 style={styles.videoTitle}>{video.title}</h4>
                  <p style={styles.videoDate}>{video.date}</p>
                  <button style={styles.videoMenu}>
                    <MoreVert />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Upload New Card */}
            <div 
              style={styles.uploadCard}
              onClick={() => navigate('/upload')}
            >
              <div style={styles.uploadIconContainer}>
                <VideoCall style={styles.uploadIcon} />
              </div>
              <p style={styles.uploadText}>Upload New Video</p>
            </div>
          </div>
        )}
        
        {activeTab === 'likes' && (
          <div style={styles.emptyState}>
            <ThumbUp style={styles.emptyIcon} />
            <h3>No liked videos yet</h3>
            <p>Videos you like will appear here</p>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div style={styles.emptyState}>
            <History style={styles.emptyIcon} />
            <h3>Watch history is empty</h3>
            <p>Videos you watch will appear here</p>
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div style={styles.emptyState}>
            <Bookmark style={styles.emptyIcon} />
            <h3>No saved videos</h3>
            <p>Save videos to watch later</p>
          </div>
        )}
      </div>
      
      {/* Achievements */}
      <div style={styles.achievementsSection}>
        <h3 style={styles.sectionTitle}>
          <EmojiEvents style={styles.sectionIcon} /> Achievements
        </h3>
        <div style={styles.achievementsGrid}>
          <div style={styles.achievement}>
            <div style={styles.achievementIcon}>🎬</div>
            <div>
              <h4>First Upload</h4>
              <p>Upload your first video</p>
            </div>
          </div>
          <div style={styles.achievement}>
            <div style={styles.achievementIcon}>👍</div>
            <div>
              <h4>100 Likes</h4>
              <p>Get 100 likes on videos</p>
            </div>
          </div>
          <div style={styles.achievement}>
            <div style={styles.achievementIcon}>👀</div>
            <div>
              <h4>1K Views</h4>
              <p>Reach 1,000 total views</p>
            </div>
          </div>
          <div style={styles.achievement}>
            <div style={styles.achievementIcon}>🛡️</div>
            <div>
              <h4>Safety Champion</h4>
              <p>Maintain 90+ safety score</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h3 style={styles.sectionTitle}>
          <Settings style={styles.sectionIcon} /> Quick Actions
        </h3>
        <div style={styles.actionsGrid}>
          <button style={styles.actionButton}>
            <Security /> Safety Settings
          </button>
          <button style={styles.actionButton}>
            <BarChart /> Analytics
          </button>
          <button style={styles.actionButton}>
            <TrendingUp /> Boost Content
          </button>
          <button style={styles.actionButton}>
            <Help /> Help & Support
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',
    paddingBottom: '80px',
  },
  header: {
    background: 'white',
    padding: '20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    '&:hover': {
      background: '#f5f5f5',
    },
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      background: '#ff4757',
    },
  },
  profileHeader: {
    background: 'white',
    padding: '30px 20px',
    borderBottom: '1px solid #eee',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    marginBottom: '25px',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: '100px',
    height: '100px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    background: '#764ba2',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': {
      background: '#667eea',
    },
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  verifiedBadge: {
    fontSize: '24px',
    color: '#4caf50',
  },
  userEmail: {
    margin: '0 0 5px 0',
    color: '#666',
    fontSize: '16px',
  },
  joinDate: {
    margin: 0,
    color: '#999',
    fontSize: '14px',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
  },
  editButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)',
    },
  },
  shareButton: {
    padding: '12px 24px',
    background: 'white',
    color: '#764ba2',
    border: '2px solid #764ba2',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    '&:hover': {
      background: '#f8f9fa',
    },
  },
  settingsButton: {
    padding: '12px',
    background: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: '#e0e0e0',
    },
  },
  statsSection: {
    padding: '25px 20px',
    background: 'white',
    borderBottom: '1px solid #eee',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '15px',
  },
  statCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statIcon: {
    fontSize: '28px',
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
  safetySection: {
    background: 'white',
    padding: '25px 20px',
    borderBottom: '1px solid #eee',
  },
  safetyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  safetyIcon: {
    fontSize: '32px',
    color: '#764ba2',
  },
  safetyTitle: {
    margin: '0 0 5px 0',
    fontSize: '20px',
    color: '#333',
  },
  safetySubtitle: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  safetyLevel: {
    marginLeft: 'auto',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreMeter: {
    marginBottom: '20px',
  },
  scoreLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#666',
  },
  meterTrack: {
    height: '12px',
    background: '#f0f0f0',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  meterFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  scoreValue: {
    textAlign: 'center',
  },
  scoreNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
  },
  scoreMax: {
    fontSize: '20px',
    color: '#666',
    marginLeft: '5px',
  },
  safetyTips: {
    background: '#f0f8ff',
    padding: '15px',
    borderRadius: '10px',
  },
  tipsTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#1976d2',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#555',
  },
  tabsSection: {
    background: 'white',
    padding: '0 20px',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: '70px',
    zIndex: 99,
  },
  tabs: {
    display: 'flex',
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  tabButton: {
    flex: 1,
    padding: '18px 20px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    position: 'relative',
    minWidth: '120px',
  },
  tabButtonActive: {
    color: '#764ba2',
    fontWeight: 'bold',
  },
  tabIcon: {
    fontSize: '20px',
  },
  tabCount: {
    background: '#764ba2',
    color: 'white',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '10px',
    marginLeft: '5px',
  },
  contentSection: {
    padding: '25px 20px',
    background: 'white',
    minHeight: '300px',
  },
  videosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '20px',
  },
  videoCard: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },
  videoThumbnail: {
    height: '280px',
    position: 'relative',
    background: '#f0f0f0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    color: 'white',
    fontSize: '12px',
  },
  videoInfo: {
    padding: '15px',
    position: 'relative',
  },
  videoTitle: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  videoDate: {
    margin: 0,
    fontSize: '12px',
    color: '#999',
  },
  videoMenu: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    padding: '5px',
    '&:hover': {
      color: '#333',
    },
  },
  uploadCard: {
    border: '2px dashed #ddd',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '280px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      borderColor: '#764ba2',
      background: '#f8f9fa',
    },
  },
  uploadIconContainer: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  uploadIcon: {
    fontSize: '32px',
    color: 'white',
  },
  uploadText: {
    margin: 0,
    color: '#764ba2',
    fontSize: '16px',
    fontWeight: '500',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    color: '#ddd',
    marginBottom: '20px',
  },
  achievementsSection: {
    background: 'white',
    padding: '25px 20px',
    marginTop: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionIcon: {
    fontSize: '24px',
    color: '#764ba2',
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  achievement: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
  },
  achievementIcon: {
    fontSize: '32px',
  },
  quickActions: {
    background: 'white',
    padding: '25px 20px',
    marginTop: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  actionButton: {
    padding: '15px',
    background: '#f8f9fa',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#f0f0f0',
      transform: 'translateY(-2px)',
    },
  },
};

export default Profile;