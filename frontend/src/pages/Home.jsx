import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Zap,
  ClipboardList,
  Bell,
  ShieldCheck,
  MapPin,
  CheckCircle2
} from "lucide-react";

function Home() {
  return (
    <div className="home">

      <nav className="navbar">
        <h2>✳ CampusCare</h2>

        <div>
          <a href="#features">Explore</a>
          <Link to="/login">Login</Link>
          <Link to="/register" className="nav-btn">
            Get Started ↗
          </Link>
        </div>
      </nav>

      <section className="hero">

        <div className="hero-content">
          <span className="eyebrow">
            <Zap size={15} /> A BETTER CAMPUS STARTS HERE
          </span>

          <h1>
            Your campus.
            <br />
            Your voice.
            <br />
            <span>Real change.</span>
          </h1>

          <p>
            From broken lights to leaking taps, report campus
            problems, follow their progress and make your
            surroundings better.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="hero-btn">
              Report an Issue <ArrowUpRight size={18} />
            </Link>

            <a href="#features" className="learn-link">
              Discover how it works ↓
            </a>
          </div>

          <div className="hero-note">
            <ShieldCheck size={17} />
            Every issue deserves attention.
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-circle"></div>

          <div className="floating-label">CAMPUS PULSE / 01</div>

          <div className="issue-card">
            <div className="issue-top">
              <span>RECENT REPORT</span>
              <span className="issue-dot"></span>
            </div>

            <div className="issue-icon">
              <Zap size={25} />
            </div>

            <h3>Electrical Issue</h3>
            <p>Ceiling fan not working</p>

            <div className="issue-location">
              <MapPin size={15} />
              Block A · Room 101
            </div>

            <div className="issue-divider"></div>

            <div className="issue-status">
              <span>Current status</span>
              <strong>● Submitted</strong>
            </div>

            <div className="progress-line">
              <span></span>
            </div>

            <small>Tracking your issue, step by step.</small>
          </div>

          <div className="floating-check">
            <CheckCircle2 size={19} />
            Issues tracked
          </div>

          <div className="visual-caption">
            SMALL ACTIONS. BETTER SPACES.
          </div>
        </div>

      </section>

      <section className="features" id="features">
        <div className="section-heading">
          <span>THE PROCESS</span>
          <h2>Making campus care effortless.</h2>
          <p>Three simple steps. One better campus.</p>
        </div>

        <div className="feature-list">

          <div className="feature-card feature-one">
            <span className="feature-number">01</span>
            <ClipboardList size={30} />
            <h3>Report it.</h3>
            <p>
              Submit an issue with its location, category
              and a short description.
            </p>
            <ArrowUpRight className="feature-arrow" />
          </div>

          <div className="feature-card feature-two">
            <span className="feature-number">02</span>
            <Bell size={30} />
            <h3>Track it.</h3>
            <p>
              Follow complaint progress and receive
              updates whenever its status changes.
            </p>
            <ArrowUpRight className="feature-arrow" />
          </div>

          <div className="feature-card feature-three">
            <span className="feature-number">03</span>
            <CheckCircle2 size={30} />
            <h3>Resolve it.</h3>
            <p>
              Committees take action and keep a record
              of every resolution.
            </p>
            <ArrowUpRight className="feature-arrow" />
          </div>

        </div>
      </section>

      <section className="bottom-cta">
        <h2>See something that needs fixing?</h2>
        <p>Don't ignore it. Be the reason it gets better.</p>
        <Link to="/login">
          Make a difference <ArrowUpRight size={18} />
        </Link>
      </section>

      <footer>
        <h3>✳ CampusCare</h3>
        <p>Built for better campuses. Made for everyone.</p>
      </footer>

    </div>
  );
}

export default Home;