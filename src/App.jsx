import "./styles/styles.css";
import banner from "./assets/home_banner_bg.png";
import scroll from "./assets/scroll_down.png";
import idfyLogo from "./assets/idfy_logo.png"

function App() {

  return (
    <div className="container">
      <header className="header">
        <div className="header-logo-section">
          <h1>PRIVY</h1>
          <p>by</p>
          <img src={idfyLogo} alt="IDfy"></img>
        </div>
        <nav className="nav">
          <a href="#about">About Us</a>
          <a href="#products">Products</a>
          <a href="#resources">Resources</a>
          <button className="book-demo">Book Demo</button>
        </nav>
      </header>

      <section className="home-banner">
        <div className="home-banner-bg">
          <img src={banner} alt="."></img>
        </div>
        <div className="home-banner-ellipse home-banner-ellipse-1"></div>
        <div className="home-banner-ellipse home-banner-ellipse-2"></div>
        <div className="home-banner-ellipse home-banner-ellipse-3"></div>
        <div className="home-banner-main">
          <div className="home-banner-text">
            <div className="home-banner-slogan">
              MANAGE COOKIES, GAIN COMPLIANCE
            </div>
            <div className="home-banner-title">
              Customize Your Cookie Consent for Ultimate Compliance
            </div>
            <div className="home-banner-subtitle">
              Leverage our unique solution to simplify cookie management
            </div>
          </div>
        </div>
        <div className="home-banner-footer">
          <p><u>How would you like to manage your cookie settings today?</u></p>
          <span>Scroll Down <img src={scroll} alt="" /></span>
        </div>
      </section>

      <div className="section-31 data">
        <div className="container-12">
          <div className="home-data">
            <div className="hd-header">



              <h2 data-w-id="877904d2-8fa1-ad57-8a62-e5aaf389adda" style={{ opacity: 1, transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", transformStyle: "preserve-3d" }} className="heading-76">
                A comprehensive consent governance suite for all enterprises
              </h2>
              <div className="div-block-21 mt20">
              </div>
            </div>
          </div>
          <div className="hd-content">
            <div data-w-id="a2ba9228-f7c1-f0c8-bf61-eb098024b59b" style={{ opacity: 1, transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", transformStyle: "preserve-3d" }} className="hd-wrapper">
              <div className="hd-inner">
                <h2 className="heading-75">
                  Inspect AI
                </h2>
                <div className="div-block-21">
                </div>
                <div className="paragraph-14px-3">
                  The compliance co-pilot
                </div>
              </div>
              <div className="paragraph-16px-4">
                A tool designed for Privacy &amp; Info-sec teams to perform DPDP gap assessments in less <br />than a minute.</div>
              <div className="div-block-20">
                <a href="/inspect-ai" className="link-6">
                  Explore Inspect AI
                </a>
                <img src="https://cdn.prod.website-files.com/65f7dd1d0e60ce666af29650/668e6ca84e4730a2ef3fa896_arrow_forward.png" loading="lazy" alt="" />
              </div>
            </div>
            <div data-w-id="a2ba9228-f7c1-f0c8-bf61-eb098024b5a5" style={{ opacity: 1, transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", transformStyle: "preserve-3d" }} className="hd-wrapper">
              <div className="hd-inner">
                <h2 className="heading-73">
                  Consent Governance<br />Platform
                </h2>
                <div className="div-block-21">
                </div>
                <div className="paragraph-14px-3">
                  The custodian off consents
                </div>
              </div>
              <div className="paragraph-16px-4">
                A Governance platform that will streamline your organisation to collect, store and manage&nbsp;&nbsp;consents the compliant way.
              </div>
              <div className="div-block-20">
                <a href="/cgp" className="link-6">
                  Explore CGP
                </a>
                <img src="https://cdn.prod.website-files.com/65f7dd1d0e60ce666af29650/668e6ca84e4730a2ef3fa896_arrow_forward.png" loading="lazy" alt="" />
              </div>
            </div>
            <div data-w-id="a2ba9228-f7c1-f0c8-bf61-eb098024b5af" style={{ opacity: 1, transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", transformStyle: "preserve-3d" }} className="hd-wrapper last">
              <div className="hd-inner">
                <h2 className="heading-74">
                  Cookie<br />Manager
                </h2>
                <div className="div-block-21">
                </div>
                <div className="paragraph-14px-3">
                  The website compliance manager
                </div>
              </div>
              <div className="paragraph-16px-4">
                Platform that manages cookie consents on your website
              </div>
              <div className="div-block-20">
                <a href="/category/cookies" className="link-6">
                  Explore cookies manager
                </a>
                <img src="https://cdn.prod.website-files.com/65f7dd1d0e60ce666af29650/668e6ca84e4730a2ef3fa896_arrow_forward.png" loading="lazy" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="yt-videos-section">
        <h1 className="heading-76" style={{ color: "black" }}>Youtube Iframe</h1>
        <div className="yt-videos-container">
          <div className="youtube-vid">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/HjhbJKK5OJU?si=jzweuRYz8NKVEgh1" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>

          <div className="youtube-vid">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/K10VXIhYf_A?si=LshFXUQeB5r4aFQ8" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>
        </div>
      </div>
      <div className="spotify-script-section">
        <h1 className="heading-76" style={{ color: "black" }}>Spotify Iframe</h1>
        <div className="spotify-script-container">
          <iframe
            src="https://open.spotify.com/embed/track/7ouMYWpwJ422jRcDASZB7P"
            width="300"
            height="380"
            allow="encrypted-media">
          </iframe>
        </div>
      </div>
      {/* Target for GTM Custom Tag Injection */}

      <h1 className="heading-76" style={{ color: "black" }}>GTM</h1>
      <div id="youtube-vid-placeholder-container">
        Waiting for Consent...
      </div>
      <div id="custom-tag-html-placeholder-container">
        Waiting for Consent...
      </div>
      <div id="vimeo-vid-placeholder-container">
        Waiting for Consent...
      </div>
      <p><u><a href="https://cookie-manager.sanketsaboo.com/" target="">link for home</a></u></p>


      {/* <main className="main-content">
        <h2>A comprehensive consent governance suite for all enterprises</h2>
        <div clπassName="cards">
          <div className="card">
            <h3>Inspect AI</h3>
            <p className="tagline">The compliance co-pilot</p>
            <p className="description">
              A tool designed for Privacy & Info-sec teams to perform DPDP gap
              assessments in less than a minute.
            </p>
            <a href="#inspect">Explore Inspect AI →</a>
          </div>
          <div className="card">
            <h3>Consent Governance Platform</h3>
            <p className="tagline">The custodian of consents</p>
            <p className="description">
              A Governance platform that will streamline your organization to
              collect, store and manage consents the compliant way.
            </p>
            <a href="#cgp">Explore CGP →</a>
          </div>
          <div className="card">
            <h3>Cookie Manager</h3>
            <p className="tagline">The website compliance manager</p>
            <p className="description">Platform that manages cookie consents on your website</p>
            <a href="#cookie">Explore Cookie Manager →</a>
          </div>
        </div>
      </main> */}
    </div>
  );
};

export default App;
