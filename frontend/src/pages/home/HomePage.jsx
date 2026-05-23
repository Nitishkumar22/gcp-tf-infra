"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, CheckCircle, ChevronRight, Cross, Image, MessageSquare, Search, Share2, ShoppingBag, Users, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

import { Link, useLocation } from "react-router-dom";
import logo from ".././../assets/logo.png";
import background from ".././../assets/Background.png";
import about from ".././../assets/about.jpg";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "about", "contact"];
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 mt-2 bg-white bg-opacity-90 backdrop-blur-sm">
        <nav className=" flex justify-between items-center container mx-auto px-6 py-1">
          <Link to="/" className="flex justify-start">
            <img src={logo} alt="Logo" className="w-40 h-auto" />
          </Link>
          <ul className="flex justify-center space-x-8">
            {["Home", "Features", "About", "Contact"].map((item) => (
              <li key={item}>
                <button
                  onClick={() => scrollTo(item.toLowerCase())}
                  className={` text-base font-normal transition-colors hover:text-primary ${
                    activeSection === item.toLowerCase()
                      ? "text-primary"
                      : "text-gray-900"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center">
            <Link to="/login" className={`px-4 py-2 rounded-md text-black`}>
              Login
            </Link>
            <Link
              to="/signup"
              className={`px-4 py-2 rounded-md text-white hover:bg-gray-800 bg-gray-900 ml-2`}
            >
              Signup
            </Link>
          </div>
        </nav>
        <motion.div className="h-1 bg-primary" style={{ scaleX }} />
      </header>

      <main className="">
        <HomeSection />
        <div className="pt-16 space-y-10">
          <FeaturesSection />
          <FAQSection />
          <AboutSection />
          <JoinCommunitySection />
          <ContactSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function HomeSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center space-y-10"
    >
      <div className=" flex items-center gap-2 bg-gray-100 rounded-3xl py-1 px-2">
        <ArrowRight className="bg-black text-white rounded-3xl pr-1 p-1" />
        <p className=" text-gray-900 font-light text-lg">Website is still under development</p>
        <ChevronRight className="px-1 w-8 h-auto" />
      </div>
      <div className="flex items-center justify-center">
        <div className="container mx-auto px-6 text-center font-poppins">
          <motion.h1
            className="text-4xl md:text-8xl font-medium text-[#1D1F20] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Connect,
          </motion.h1>
          <motion.h1
            className="text-4xl md:text-7xl font-bold text-[#1D1F20] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Collaborate <span className="font-medium">&</span> Create
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-balck mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            with a global network of filmmakers and technicians.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/login">
              <Button
                size="lg"
                className="bg-black text-primary rounded-lg text-white hover:bg-gray-100"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Explore & Connect",
      description: "Search for technicians and filmmakers by skills, location, and projects.",
    },
    {
      icon: MessageSquare,
      title: "Collaborate",
      description: "Post collaboration requests and join exciting projects.",
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Buy, sell, or rent equipment and services within the community.",
    },
    {
      icon: Share2,
      title: "Community Posts",
      description: "Share experiences, tips, and industry news with fellow professionals.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white my-4">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-semibold text-left text-[#1D1F20] mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-lg rounded-3xl text-white w-[300px] h-[400px]
              transition-shadow duration-300 bg-[#101010] bg-opacity-95">
                <CardHeader>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  >
                    <feature.icon className="h-8 w-8 text-slate-200" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-white">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JoinCommunitySection() {
  return (
    <section id="join" className="py-20 bg-[#020202] opacity-95 text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-5xl font-semibold mb-8">
          Join the Cinemates Community
        </h2>
        <p className="text-xl mb-12">
          Connect with fellow filmmakers, find your next project, and take your
          career to new heights.
        </p>
        <Link to="/signup">
          <Button
            size="lg"
            className="bg-white text-black hover:bg-primary-dark"
          >
            Get Started Now
          </Button>
        </Link>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="max-w-2xl mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              How do I get started on Cinemates?
            </AccordionTrigger>
            <AccordionContent>
              Getting started is easy! Simply sign up for an account, complete
              your profile with your skills and experience, and start exploring
              the community. You can immediately start connecting with other
              professionals, posting your work, or searching for collaboration
              opportunities.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is Cinemates free to use?</AccordionTrigger>
            <AccordionContent>
              Cinemates offers both free and premium membership options. Our
              basic features, including profile creation, networking, and
              community posts, are free for all users. Premium members enjoy
              additional benefits such as advanced search filters, priority
              listing in search results, and access to exclusive industry events
              and resources.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div
            className="md:w-1/2 mb-8 md:mb-0 pr-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Who are <span className=" font-semibold text-4xl  text-slate-500">WE</span></h2>
            <p className="text-gray-600 mb-4">
              We are a team of passionate individuals dedicated to creating
              innovative solutions that make a difference. Our mission is to
              empower businesses and individuals with cutting-edge technology.
            </p>
            <p className="text-gray-600 mr-4">
              With years of experience and a commitment to excellence, we strive
              to deliver the best products and services to our clients.
            </p>
          </motion.div>
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <img
              src={about}
              alt="About Us"
              className="rounded-lg shadow-lg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Contact Us
        </h2>
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                We'd love to hear from you. Send us a message and we'll respond
                as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <Textarea id="message" placeholder="Your message" />
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#020202] text-white py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 text-center md:text-left md:mb-0">
            <h3 className="text-2xl font-bold">Cinemates</h3>
            <p className="mt-2 text-sm">Joining all ends, CINEMATICALLY</p>
          </div>

          <div className="w-full md:w-1/3 text-center md:text-right">
            <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="#" className="hover:text-primary transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Facebook
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Company Name. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
