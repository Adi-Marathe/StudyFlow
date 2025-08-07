import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col} from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../../Assets/images/StudyFlow-logo.png';
import '../Landingpage/Landingpage.css';
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FaRocket, FaBook, FaLightbulb, FaTasks, FaUserGraduate, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { DarkModeContext } from '../../context/DarkModeContext';

function Landingpage(){

    // HOOK
    const navigate = useNavigate();

    // NAVBAR
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const link = "footer-link d-block mb-1";

    return(
        <>

        {/* NAVBAR */}
        <Navbar fixed="top" className={`l-navbar ${isDarkMode ? 'dark' : ''} ${scrolled ? 'scrolled' : ''}` }>
            <Container fluid>
            <Navbar.Brand href="#home" >
                <img
                alt="StudyFlow"
                src={logo}
                height="50"
                className="d-inline-block align-top"
                />{' '}
                Study<span>Flow</span>
            </Navbar.Brand>

            {/* Toggle Button */}
            <div className="dark-mode-toggle" onClick={toggleDarkMode}>
                <div className={`toggle-switch ${isDarkMode ? "active" : ""}`}>
                <span className="icon sun"><MdLightMode /></span>
                <span className="icon moon"><MdDarkMode /></span>
                <div className="toggle-slider" />
                </div>
            </div>
            </Container>
        </Navbar>


        {/* HERO SECTION */}
        <Container fluid className='hero-section-main-container'>
            <div className='hero-img-container'>
                <DotLottieReact
                src="https://lottie.host/347c3dae-5c3b-417c-b32d-645bd4898f43/aM9YhWlVus.lottie"
                loop
                autoplay
                />
            </div>
            <div className='hero-right-container'>
                <div className='hero-title-container'>
                    <h1>From basic to breakthroughs,<br/><span> all in one flow.</span></h1>
                </div>
                <div className='register-container'>
                    <button onClick={() => navigate('/register')} className='btn-hover' id='registerBtn'>GET STARTED</button>
                    <button onClick={() => navigate('/login')} className='btn-hover' id='loginBtn'>I ALREADY HAVE AN ACCOUNT</button>
                </div>
            </div>
            <div className="hero-marquee">
              <div className="scrolling-text">
                <span><FaRocket /> Study Smarter, Not Harder</span>
                <span><FaBook /> Everything You Need to Succeed</span>
                <span><FaLightbulb /> Master Concepts with Ease</span>
                <span><FaTasks /> Plan. Track. Achieve.</span>
                <span><FaUserGraduate /> Empowering Every Student</span>

                <span><FaRocket /> Study Smarter, Not Harder</span>
                <span><FaBook /> Everything You Need to Succeed</span>
                <span><FaLightbulb /> Master Concepts with Ease</span>
                <span><FaTasks /> Plan. Track. Achieve.</span>
                <span><FaUserGraduate /> Empowering Every Student</span>
              </div>
            </div>
        </Container>
        

        {/* FEATURES SECTION */}
        <Container fluid className="Features-Section">
            <section className="Features-container">
                <div className="Features-info">
                <h1>free. smart. powerful.</h1>
                <p>
                    Studying with StudyFlow is simple and effective. Whether you're summarizing a textbook, planning your week, or revising with flashcards, we make it easy to learn better, not harder.
                </p>
                </div>
                <div className="Features-img">
                <DotLottieReact
                    src="https://lottie.host/2be83721-ecad-4afe-8352-63a251293849/0No9Cvqevj.lottie"
                    loop
                    autoplay
                    />
                </div>
            </section>
            <section className="Features-container">
                <div className="Features-img">
                <DotLottieReact
                    src="https://lottie.host/df0c672e-a631-41c5-a90c-998daab3a19d/R7cQiL5Hg5.lottie"
                    loop
                    autoplay
                    />
                </div>
                <div className="Features-info">
                <h1>backed by science.<br/>boosted by AI.</h1>
                <p>
                    StudyFlow uses proven study techniques like spaced repetition and time-blocking — powered by AI. Upload notes or documents and get quick summaries, answers, and personalized support from your study assistant.
                </p>
                </div>
            </section>
            <section className="Features-container">
                <div className="Features-info">
                <h1>stay productive. stay focused.</h1>
                <p>
                    Manage time with Pomodoro sessions, stay on track with to-do lists, and organize your study life with a powerful event scheduler. Lock distractions with Focus Mode and power through your study goals.
                </p>
                </div>
                <div className="Features-img">
                <DotLottieReact
                    src="https://lottie.host/f1bb23b6-c203-4398-9d1a-98c122b0f95a/UdsxUr3NIr.lottie"
                    loop
                    autoplay
                />
                </div>
                
            </section>
            <section className="Features-container">
                <div className="Features-img">
                <DotLottieReact
                    src="https://lottie.host/2551d099-1d30-409e-9970-c919a2f5a0f0/JwkeyLTDBw.lottie"
                    loop
                    autoplay
                    />
                </div>
                <div className="Features-info">
                <h1>visual tools to unlock deep learning</h1>
                <p>
                    Structure your thoughts with our mind map creator. Break topics into digestible chunks using your own flashcards. Organize your ideas with a clean, user-friendly note editor designed for clarity and recall.
                </p>
                </div>
            </section>
            <section className="Features-container">
                <div className="Features-info">
                <h1> collaborate and connect</h1>
                <p>
                    Join study groups, chat with peers, or work together in real-time on shared notes and maps. Whether you're preparing for an exam or revising together, StudyFlow helps you learn better — together.
                </p>
                </div>
                <div className="Features-img">   
                <DotLottieReact
                    src="https://lottie.host/41ce5109-7345-405a-8669-58f8b1001bf1/SlyPY5diXt.lottie"
                    loop
                    autoplay
                />
                </div>
            </section>
            <section className="Features-container">
                <div className="Features-img">
                    <DotLottieReact
                    src="https://lottie.host/32c46dfd-77e1-4522-b058-fb556788f436/Nf7hW4i2Gs.lottie"
                    loop
                    autoplay
                    />
                </div>
                <div className="Features-info">
                <h1>study anywhere, anytime</h1>
                <p>      
                    Your tasks, notes, flashcards, and chat history are stored securely and accessible across devices. Study at home, on campus, or on the go — your study tools follow wherever you do.
                </p>
                </div>
            </section>
                
            <section className="level-up">
            <div className="level-up-content">
                <h1>
                Level up your learning<br />
                journey with Study<span className="flow">Flow</span>
                </h1>
                <button onClick={() => navigate('/register')}>Get Started</button>
            </div>
            <br/><br/><br/><br/><br/>
            </section>
        </Container>

        {/* FOOTER */}
        <footer className="footer-skin py-5">
            <Container>
                {/* top row */}
                <Row className="gy-4">
                {/* Brand / About blurb */}
                <Col md={4} lg={3}>
                    <h5 className="brand-title mb-2 study"><img src={logo} alt="StudyFlow" className="logo" /> Study</h5>
                    <h5 className="brand-title mb-2 flow">Flow</h5>
                    <p className="small">
                    The all-in-one digital workspace that helps students focus, learn, and collaborate with AI-powered productivity tools.
                    </p>
                </Col>

                {/* Company */}
                <Col xs={6} md={4} lg={2}>
                    <h6 className="fw-bold mb-2">Company</h6>
                    <a href="/#" className={link}>About Us</a>
                    <a href="/#" className={link}>How it Works</a>
                    <a href="/#" className={link}>Meet the Team</a>
                    <a href="/#" className={link}>Careers</a>
                </Col>

                {/* Products */}
                <Col xs={6} md={4} lg={2}>
                    <h6 className="fw-bold mb-2">Products</h6>
                    <a href="/#" className={link}>AI Assistant</a>
                    <a href="/#" className={link}>Pomodoro Timer</a>
                    <a href="/#" className={link}>Mind Map Creator</a>
                    <a href="/#" className={link}>Flashcards</a>
                    <a href="/#" className={link}>Rich‑Text Notes</a>
                    <a href="/#" className={link}>Group Chat</a>
                </Col>

                

                {/* Support */}
                <Col xs={6} md={4} lg={2}>
                    <h6 className="fw-bold mb-2">Support</h6>
                    <a href="/#" className={link}>FAQ</a>
                    <a href="/#" className={link}>User Guides</a>
                    <a href="/#" className={link}>Help Center</a>
                    <a href="/#" className={link}>Report a Bug</a>
                </Col>

                {/* Contact / Social */}
                <Col md={6} lg={3}>
                    <h6 className="fw-bold mb-2">Contact Info</h6>
                    <p className="small mb-1">support@studyflow.com</p>
                    <p className="small">
                    Gut No. 30, Hiwarkheda Road,<br/> Kannad, Chh.Sambhajinagar,<br/> Maharashtra 431103
                    </p>
                    <div className="d-flex gap-2 mt-2">
                    <a className="icon-btn" href="/#"><FaFacebookF /></a>
                    <a className="icon-btn" href="/#"><FaTwitter /></a>
                    <a className="icon-btn" href="/#"><FaInstagram /></a>
                    <a className="icon-btn" href="/#"><FaLinkedinIn /></a>
                    <a className="icon-btn" href="/#"><FaYoutube /></a>
                    </div>
                </Col>
                </Row>

                {/* bottom bar */}
                <hr className="my-4 opacity-50" />
                <p className="text-center small mb-0">
                © 2025 StudyFlow · Made with ❤️ by IETKDevs 
                </p>
            </Container>
        </footer>
        </>
    );

}

export default Landingpage;