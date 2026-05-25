import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow-line" />
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-mark">M</span>
            <span>memorix</span>
          </div>
          <p className="footer-tagline">
            Transform information into long-term memory.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="/practice">Practice Mode</a>
            <a href="/test">Test Mode</a>
            <a href="/upload">Upload Content</a>
            <a href="/dashboard">Dashboard</a>
          </div>
          <div className="footer-col">
            <h4>Features</h4>
            <a href="#how-it-works">How It Works</a>
            <a href="#practice-modes">Practice Modes</a>
            <a href="#memory-system">Memory System</a>
            <a href="#stats">Analytics</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Memorix. Built for smarter learning.</p>
        </div>
      </div>
    </footer>
  );
}
