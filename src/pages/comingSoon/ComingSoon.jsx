import React from 'react';

const ComingSoon = ({ 
    title = "Coming Soon", 
    description = "This feature is under development and will be available soon.",
    icon = "🚀"
}) => {
    // Check if mobile based on window width
    const isMobile = window.innerWidth <= 768;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: '#ffffff',
                padding: isMobile ? '3rem 2rem' : '4rem 3rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}>
                {/* Animated Icon */}
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    animation: 'bounce 2s infinite'
                }}>
                    {icon}
                </div>

                {/* Title */}
                <h1 style={{
                    margin: '0 0 1rem',
                    fontSize: isMobile ? '2rem' : '2.5rem',
                    color: '#1e293b',
                    fontWeight: '700'
                }}>
                    {title}
                </h1>

                {/* Description */}
                <p style={{
                    margin: '0 0 2rem',
                    color: '#64748b',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    lineHeight: '1.6'
                }}>
                    {description}
                </p>

                {/* Progress Indicator */}
                <div style={{
                    background: '#e2e8f0',
                    borderRadius: '10px',
                    height: '8px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(90deg, #3b82f6, #3b82f6aa)',
                        height: '100%',
                        width: '60%',
                        borderRadius: '10px',
                        animation: 'progress 3s ease-in-out infinite'
                    }}></div>
                </div>

                {/* Status */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#dbeafe',
                    color: '#3b82f6',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }}></div>
                    In Development
                </div>

                {/* Features Preview */}
                <div style={{
                    marginTop: '3rem',
                    padding: '2rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{
                        margin: '0 0 1rem',
                        color: '#1e293b',
                        fontSize: '1.2rem'
                    }}>
                        What's Coming?
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: '1rem',
                        textAlign: 'left'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#64748b',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ color: '#10b981' }}>✓</span>
                            Advanced Analytics
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#64748b',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ color: '#10b981' }}>✓</span>
                            Real-time Updates
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#64748b',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ color: '#f59e0b' }}>⏳</span>
                            Enhanced UI/UX
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#64748b',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ color: '#f59e0b' }}>⏳</span>
                            Mobile Optimization
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-20px);
                    }
                    60% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes progress {
                    0% {
                        width: 30%;
                    }
                    50% {
                        width: 70%;
                    }
                    100% {
                        width: 60%;
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.7;
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
};

export default ComingSoon;