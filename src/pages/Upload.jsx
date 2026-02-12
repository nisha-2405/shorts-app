// src/pages/Upload.jsx - WITH MOCK UPLOAD
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  Upload as UploadIcon,
  VideoCall,
  Close,
  CheckCircle,
  Warning,
  Security,
  Title as TitleIcon,
  Description,
  CloudUpload,
  Cancel,
  Info
} from '@mui/icons-material';
import { auth } from '../firebase';
// Add this with your other imports
import { detectCyberbullying } from '../services/cyberbullyingService';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  // Cyberbullying detection states
  const [cyberbullyingCheck, setCyberbullyingCheck] = useState({
    checking: false,
    score: 0,
    isToxic: false,
    categories: [],
    warning: ''
  });

  const onDrop = useCallback((acceptedFiles) => {
    const videoFile = acceptedFiles[0];
    if (videoFile) {
      // Check file type
      if (!videoFile.type.startsWith('video/')) {
        setUploadError('Please upload a video file (MP4, MOV, AVI, etc.)');
        return;
      }
      
      // Check file size (max 100MB)
      if (videoFile.size > 100 * 1024 * 1024) {
        setUploadError('File size too large. Maximum 100MB allowed.');
        return;
      }
      
      setFile(videoFile);
      setUploadError('');
      
      // Auto-check title for cyberbullying when file is selected
      if (title) {
        checkForCyberbullying(title);
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    maxFiles: 1
  });

  // Cyberbullying Detection Function - MOCK VERSION
  const checkForCyberbullying = async (text) => {
    if (!text.trim()) return;
    
    setCyberbullyingCheck(prev => ({ ...prev, checking: true }));
    
    try {
      // Mock API call - simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock detection logic
      const toxicWords = [
        'hate', 'stupid', 'ugly', 'kill', 'die', 'worthless', 'dumb', 'idiot',
        'retard', 'fat', 'skinny', 'nobody', 'failure', 'useless', 'suck'
      ];
      
      const hatePhrases = [
        'i hate', 'you suck', 'go die', 'kill yourself', 'no one likes you'
      ];
      
      const textLower = text.toLowerCase();
      let score = 0;
      let categories = new Set();
      
      // Check for toxic words
      toxicWords.forEach(word => {
        if (textLower.includes(word)) {
          score += 0.2;
          categories.add(word);
        }
      });
      
      // Check for hate phrases
      hatePhrases.forEach(phrase => {
        if (textLower.includes(phrase)) {
          score += 0.5;
          categories.add('hate_speech');
        }
      });
      
      // Add random factor (0-0.2) to simulate AI uncertainty
      const randomFactor = Math.random() * 0.2;
      score = Math.min(score + randomFactor, 1);
      
      const isToxic = score > 0.5;
      const warning = isToxic 
        ? `Potential cyberbullying detected (Score: ${score.toFixed(2)})`
        : '';
      
      setCyberbullyingCheck({
        checking: false,
        score: score,
        isToxic,
        categories: Array.from(categories),
        warning
      });
      
    } catch (error) {
      console.error('Cyberbullying check failed:', error);
      setCyberbullyingCheck(prev => ({ ...prev, checking: false }));
    }
  };

  // MOCK UPLOAD FUNCTION
  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a video file');
      return;
    }
    
    if (!title.trim()) {
      setUploadError('Please add a title for your video');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      setUploadError('Please login to upload videos');
      navigate('/login');
      return;
    }
    
    // Check for cyberbullying before upload
    if (cyberbullyingCheck.isToxic) {
      const proceed = window.confirm(
        `⚠️ WARNING: Cyberbullying Detected\n\n` +
        `Score: ${cyberbullyingCheck.score.toFixed(2)}\n` +
        `Categories: ${cyberbullyingCheck.categories.join(', ')}\n\n` +
        `This content may be harmful to others.\n` +
        `Do you still want to proceed with upload?`
      );
      if (!proceed) return;
    }
    
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadProgress(0);
    
    // Mock upload progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 20;
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          
          // Simulate processing completion
          setTimeout(() => {
            setUploadSuccess('🎉 Video uploaded successfully! (MOCK MODE)');
            
            // Show success message
            alert(
              '✅ Upload Complete!\n\n' +
              'In mock mode, the video is not actually uploaded to Firebase.\n' +
              'In production, this would save to Firebase Storage and Firestore.\n\n' +
              'Title: ' + title + '\n' +
              'File: ' + file.name + '\n' +
              'Size: ' + (file.size / (1024 * 1024)).toFixed(2) + ' MB\n' +
              'Cyberbullying Score: ' + cyberbullyingCheck.score.toFixed(2)
            );
            
            // Reset form after delay
            setTimeout(() => {
              setFile(null);
              setTitle('');
              setDescription('');
              setUploadProgress(0);
              setIsUploading(false);
              setCyberbullyingCheck({
                checking: false,
                score: 0,
                isToxic: false,
                categories: [],
                warning: ''
              });
              
              // Navigate back to home
              navigate('/');
            }, 1500);
          }, 500);
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  
    if (newTitle.length > 3) {
      try {
        const result = await detectCyberbullying(newTitle);
        console.log('Detection result:', result);
      
        setCyberbullyingCheck({
          checking: false,
          score: result.score || 0,
          isToxic: result.isToxic || false,
          categories: result.categories || [],
          warning: result.warning || ''
        });
      } catch (error) {
        console.error('Detection failed:', error);
      }
    } else {
      // Reset detection when text is too short
      setCyberbullyingCheck({
        checking: false,
        score: 0,
        isToxic: false,
        categories: [],
        warning: ''
      });
    }
  };

  const handleCancel = () => {
    if (isUploading) {
      if (window.confirm('Upload in progress. Are you sure you want to cancel?')) {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadError('Upload cancelled');
      }
    } else {
      navigate('/');
    }
  };

  // Generate mock thumbnail based on title
  const getMockThumbnail = () => {
    if (!title) return 'https://via.placeholder.com/320x568/667eea/ffffff?text=Upload+Video';
    const encodedTitle = encodeURIComponent(title.substring(0, 30));
    return `https://via.placeholder.com/320x568/764ba2/ffffff?text=${encodedTitle}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleCancel} style={styles.backButton}>
          <Close /> {isUploading ? 'Cancel Upload' : 'Back to Home'}
        </button>
        <h1 style={styles.headerTitle}>
          <VideoCall style={styles.headerIcon} /> Upload Short Video
        </h1>
        <div style={styles.modeBadge}>
          <Info style={styles.infoIcon} /> MOCK MODE
        </div>
      </div>

      <div style={styles.content}>
        {/* Mode Indicator */}
        <div style={styles.modeIndicator}>
          <div style={styles.modeContent}>
            <Warning style={styles.modeIcon} />
            <div>
              <h4 style={styles.modeTitle}>Development Mode Active</h4>
              <p style={styles.modeText}>
                Videos are not actually uploaded to Firebase. This is for testing UI and cyberbullying detection only.
                Enable Firebase Storage rules to switch to production mode.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div 
          {...getRootProps()} 
          style={{
            ...styles.uploadArea,
            borderColor: isDragActive ? '#764ba2' : '#ddd',
            background: isDragActive ? '#f0f0ff' : 'white',
            opacity: isUploading ? 0.7 : 1
          }}
        >
          <input {...getInputProps()} disabled={isUploading} />
          
          {file ? (
            <div style={styles.fileInfo}>
              <div style={styles.thumbnailPreview}>
                <img 
                  src={getMockThumbnail()} 
                  alt="Thumbnail preview" 
                  style={styles.thumbnailImage}
                />
                <div style={styles.videoLabel}>🎬 {file.name}</div>
              </div>
              <div style={styles.fileDetails}>
                <p style={styles.fileName}>
                  <VideoCall style={styles.fileIcon} /> {file.name}
                </p>
                <p style={styles.fileSize}>
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • Type: {file.type}
                </p>
                
                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div style={styles.progressSection}>
                    <div style={styles.progressContainer}>
                      <div 
                        style={{
                          ...styles.progressBar,
                          width: `${uploadProgress}%`
                        }}
                      ></div>
                    </div>
                    <div style={styles.progressText}>
                      Uploading... {uploadProgress.toFixed(0)}%
                      {uploadProgress >= 100 && ' • Processing...'}
                    </div>
                  </div>
                )}
                
                {!isUploading && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setUploadProgress(0);
                    }}
                    style={styles.removeButton}
                  >
                    <Cancel /> Remove File
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.uploadPrompt}>
              <CloudUpload style={styles.uploadIcon} />
              <p style={styles.uploadText}>
                {isDragActive ? '📤 Drop video here!' : '📁 Drag & drop or click to select video'}
              </p>
              <p style={styles.uploadSubtext}>
                Supports: MP4, MOV, AVI, MKV, WebM • Max: 100MB
              </p>
              <div style={styles.uploadTips}>
                <span>💡 Tip: Shorter videos (15-60s) perform better!</span>
              </div>
            </div>
          )}
        </div>

        {/* Cyberbullying Detection Results */}
        <div style={styles.detectionSection}>
          <div style={styles.sectionHeader}>
            <Security style={styles.sectionIcon} />
            <h3 style={styles.sectionTitle}>AI Safety Check</h3>
            {cyberbullyingCheck.checking && (
              <div style={styles.checkingIndicator}>
                <div style={styles.spinner}></div> Analyzing...
              </div>
            )}
          </div>
          
          {cyberbullyingCheck.warning && (
            <div style={styles.warningBox}>
              <div style={styles.warningHeader}>
                <Warning style={styles.warningIcon} />
                <div>
                  <h4 style={styles.warningTitle}>⚠️ Content Warning</h4>
                  <p style={styles.warningText}>{cyberbullyingCheck.warning}</p>
                </div>
              </div>
              
              {cyberbullyingCheck.categories.length > 0 && (
                <div style={styles.categoriesBox}>
                  <strong>Detected Issues:</strong>
                  <div style={styles.categoryTags}>
                    {cyberbullyingCheck.categories.map((category, index) => (
                      <span key={index} style={styles.categoryTag}>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={styles.scoreMeter}>
                <div style={styles.scoreLabels}>
                  <span>Low Risk</span>
                  <span>High Risk</span>
                </div>
                <div style={styles.meterTrack}>
                  <div 
                    style={{
                      ...styles.meterFill,
                      width: `${cyberbullyingCheck.score * 100}%`,
                      background: cyberbullyingCheck.score > 0.7 ? '#ff6b6b' : 
                                 cyberbullyingCheck.score > 0.4 ? '#ff9800' : '#4caf50'
                    }}
                  ></div>
                </div>
                <div style={styles.scoreValue}>
                  Safety Score: <strong>{cyberbullyingCheck.score.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
          
          {!cyberbullyingCheck.warning && !cyberbullyingCheck.checking && title && (
            <div style={styles.safeBox}>
              <CheckCircle style={styles.safeIcon} />
              <div>
                <h4 style={styles.safeTitle}>✅ Content Appears Safe</h4>
                <p style={styles.safeText}>
                  No cyberbullying or harmful content detected.
                  {cyberbullyingCheck.score > 0 && ` Safety score: ${cyberbullyingCheck.score.toFixed(2)}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Details Form */}
        <div style={styles.formSection}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <TitleIcon style={styles.labelIcon} /> Video Title *
            </label>
            <input
              type="text"
              placeholder="Give your video a catchy title... (Required)"
              value={title}
              onChange={handleTitleChange}
              style={styles.input}
              maxLength="100"
              disabled={isUploading}
            />
            <div style={styles.inputFooter}>
              <span style={styles.charCount}>{title.length}/100 characters</span>
              <span style={styles.requiredText}>* Required field</span>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <Description style={styles.labelIcon} /> Description
            </label>
            <textarea
              placeholder="Describe your video, add hashtags, or mention others... (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              rows="4"
              maxLength="500"
              disabled={isUploading}
            />
            <div style={styles.inputFooter}>
              <span style={styles.charCount}>{description.length}/500 characters</span>
              <span style={styles.optionalText}>Optional field</span>
            </div>
            
            <div style={styles.hashtagTips}>
              <span>💡 Hashtag Tips:</span>
              <div style={styles.hashtagExamples}>
                #shorts #viral #funny #tutorial #lifehacks #trending
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div style={styles.errorBox}>
            <Warning style={styles.errorIcon} />
            <div>
              <p style={styles.errorTitle}>Upload Error</p>
              <p style={styles.errorText}>{uploadError}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div style={styles.successBox}>
            <CheckCircle style={styles.successIcon} />
            <div>
              <p style={styles.successTitle}>Upload Successful!</p>
              <p style={styles.successText}>{uploadSuccess}</p>
              <p style={styles.successSubtext}>
                Redirecting to home page in a moment...
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button
            onClick={handleCancel}
            style={styles.cancelButton}
            disabled={isUploading}
          >
            <Close /> Cancel
          </button>
          
          <button
            onClick={handleUpload}
            disabled={isUploading || !file || !title.trim()}
            style={{
              ...styles.uploadButton,
              background: cyberbullyingCheck.isToxic
                ? 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'
                : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              opacity: (!file || !title.trim() || isUploading) ? 0.6 : 1,
              cursor: (!file || !title.trim() || isUploading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? (
              <>
                <div style={styles.buttonSpinner}></div>
                Uploading... {uploadProgress.toFixed(0)}%
              </>
            ) : cyberbullyingCheck.isToxic ? (
              <>
                <Warning /> Upload Anyway (Warning)
              </>
            ) : (
              <>
                <UploadIcon /> Upload Video (Mock Mode)
              </>
            )}
          </button>
        </div>

        {/* Development Notes */}
        <div style={styles.devNotes}>
          <h4 style={styles.devTitle}>🛠️ Development Notes:</h4>
          <ul style={styles.devList}>
            <li>This is a mock upload - no actual files are sent to Firebase</li>
            <li>Cyberbullying detection uses mock AI (replace with your trained model)</li>
            <li>To enable real uploads: Update Firebase Storage rules and uncomment Firebase code</li>
            <li>Progress bar is simulated for testing purposes</li>
          </ul>
          <button 
            onClick={() => window.open('https://firebase.google.com/docs/storage/security', '_blank')}
            style={styles.devLink}
          >
            🔗 Learn about Firebase Storage Security Rules
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    paddingBottom: '20px',
  },
  header: {
    background: 'white',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
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
    transition: 'all 0.3s',
    '&:hover': {
      background: '#f5f5f5',
      color: '#333',
    },
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerIcon: {
    fontSize: '28px',
    color: '#764ba2',
  },
  modeBadge: {
    background: '#ff9800',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoIcon: {
    fontSize: '18px',
  },
  content: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  modeIndicator: {
    background: '#fff3e0',
    border: '2px solid #ff9800',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
  },
  modeContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  },
  modeIcon: {
    fontSize: '32px',
    color: '#ff9800',
    flexShrink: 0,
  },
  modeTitle: {
    margin: '0 0 10px 0',
    color: '#e65100',
    fontSize: '18px',
  },
  modeText: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  uploadArea: {
    border: '3px dashed #ddd',
    borderRadius: '16px',
    padding: '40px 20px',
    textAlign: 'center',
    marginBottom: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  uploadPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
  },
  uploadIcon: {
    fontSize: '64px',
    color: '#764ba2',
    opacity: 0.8,
  },
  uploadText: {
    fontSize: '20px',
    color: '#333',
    margin: 0,
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  uploadTips: {
    marginTop: '15px',
    padding: '10px 20px',
    background: '#f0f8ff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1976d2',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'left',
  },
  thumbnailPreview: {
    position: 'relative',
    flexShrink: 0,
  },
  thumbnailImage: {
    width: '160px',
    height: '280px',
    borderRadius: '10px',
    objectFit: 'cover',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  videoLabel: {
    position: 'absolute',
    bottom: '10px',
    left: 0,
    right: 0,
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '8px',
    fontSize: '12px',
    textAlign: 'center',
    borderRadius: '0 0 10px 10px',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  fileIcon: {
    fontSize: '24px',
    color: '#764ba2',
  },
  fileSize: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#666',
  },
  progressSection: {
    marginBottom: '20px',
  },
  progressContainer: {
    width: '100%',
    height: '10px',
    background: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    borderRadius: '5px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '13px',
    color: '#666',
    textAlign: 'center',
  },
  removeButton: {
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
    transition: 'all 0.3s',
    '&:hover': {
      background: '#ff4757',
    },
  },
  detectionSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '15px',
  },
  sectionIcon: {
    fontSize: '28px',
    color: '#764ba2',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#333',
    flex: 1,
  },
  checkingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#666',
    fontSize: '14px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #764ba2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  warningBox: {
    background: '#fff8e1',
    border: '2px solid #ffc107',
    borderRadius: '12px',
    padding: '20px',
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '15px',
  },
  warningIcon: {
    fontSize: '32px',
    color: '#ff9800',
    flexShrink: 0,
  },
  warningTitle: {
    margin: '0 0 8px 0',
    color: '#e65100',
    fontSize: '18px',
  },
  warningText: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  categoriesBox: {
    marginBottom: '20px',
  },
  categoryTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
  },
  categoryTag: {
    background: '#ffecb3',
    color: '#e65100',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  scoreMeter: {
    background: 'white',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #eee',
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
    fontSize: '14px',
    color: '#333',
  },
  safeBox: {
    background: '#e8f5e9',
    border: '2px solid #4caf50',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  safeIcon: {
    fontSize: '32px',
    color: '#4caf50',
    flexShrink: 0,
  },
  safeTitle: {
    margin: '0 0 5px 0',
    color: '#2e7d32',
    fontSize: '18px',
  },
  safeText: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  formSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  inputGroup: {
    marginBottom: '30px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  labelIcon: {
    fontSize: '20px',
    color: '#764ba2',
  },
  input: {
    width: '100%',
    padding: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
    '&:focus': {
      outline: 'none',
      borderColor: '#764ba2',
      boxShadow: '0 0 0 3px rgba(118, 75, 162, 0.1)',
    },
    '&:disabled': {
      background: '#f5f5f5',
      cursor: 'not-allowed',
    },
  },
  textarea: {
    width: '100%',
    padding: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '120px',
    transition: 'all 0.3s',
    '&:focus': {
      outline: 'none',
      borderColor: '#764ba2',
      boxShadow: '0 0 0 3px rgba(118, 75, 162, 0.1)',
    },
    '&:disabled': {
      background: '#f5f5f5',
      cursor: 'not-allowed',
    },
  },
  inputFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontSize: '12px',
  },
  charCount: {
    color: '#666',
  },
  requiredText: {
    color: '#f44336',
    fontWeight: '500',
  },
  optionalText: {
    color: '#4caf50',
    fontWeight: '500',
  },
  hashtagTips: {
    marginTop: '15px',
    padding: '12px',
    background: '#f0f8ff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1976d2',
  },
  hashtagExamples: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#333',
    fontStyle: 'italic',
  },
  errorBox: {
    background: '#ffebee',
    border: '2px solid #ffcdd2',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  },
  errorIcon: {
    fontSize: '24px',
    color: '#f44336',
    flexShrink: 0,
  },
  errorTitle: {
    margin: '0 0 5px 0',
    color: '#c62828',
    fontSize: '16px',
    fontWeight: '600',
  },
  errorText: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  successBox: {
    background: '#e8f5e9',
    border: '2px solid #c8e6c9',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  },
  successIcon: {
    fontSize: '24px',
    color: '#4caf50',
    flexShrink: 0,
  },
  successTitle: {
    margin: '0 0 5px 0',
    color: '#2e7d32',
    fontSize: '16px',
    fontWeight: '600',
  },
  successText: {
    margin: '0 0 5px 0',
    color: '#666',
    fontSize: '14px',
  },
  successSubtext: {
    margin: 0,
    color: '#666',
    fontSize: '12px',
    fontStyle: 'italic',
  },
  actionButtons: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  cancelButton: {
    flex: 1,
    padding: '18px',
    background: '#f5f5f5',
    color: '#666',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#e0e0e0',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  uploadButton: {
    flex: 2,
    padding: '18px',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    '&:hover:not(:disabled)': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    },
  },
  buttonSpinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  devNotes: {
    background: '#f5f5f5',
    border: '2px dashed #999',
    borderRadius: '12px',
    padding: '20px',
    fontSize: '14px',
    color: '#666',
  },
  devTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '16px',
  },
  devList: {
    margin: '0 0 15px 0',
    paddingLeft: '20px',
  },
  devLink: {
    background: 'none',
    border: 'none',
    color: '#1976d2',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    '&:hover': {
      color: '#0d47a1',
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

export default Upload;