import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Divider,
  Link,
  Input,
  Textarea,
  Chip,
  Avatar,
  Tooltip,
  Switch,
} from "@heroui/react";
import { motion } from "framer-motion";

// Icons
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const menuItems = ["Home", "Features", "About", "Team", "Contact"];

  const features = [
    {
      title: "Lightning Fast",
      description: "Built with modern technologies for blazing fast performance and instant load times.",
      icon: "⚡",
      color: "warning",
    },
    {
      title: "Secure & Reliable",
      description: "Enterprise-grade security with end-to-end encryption and 99.9% uptime guarantee.",
      icon: "🔒",
      color: "success",
    },
    {
      title: "AI Powered",
      description: "Leverage cutting-edge artificial intelligence to automate and optimize your workflow.",
      icon: "🤖",
      color: "secondary",
    },
    {
      title: "Cloud Native",
      description: "Seamlessly deploy and scale across multiple cloud providers with zero configuration.",
      icon: "☁️",
      color: "primary",
    },
    {
      title: "Real-time Analytics",
      description: "Get instant insights with live dashboards and comprehensive reporting tools.",
      icon: "📊",
      color: "danger",
    },
    {
      title: "24/7 Support",
      description: "Our dedicated team is always available to help you succeed with round-the-clock support.",
      icon: "🎧",
      color: "warning",
    },
  ];

  const team = [
    { name: "Alex Johnson", role: "CEO & Founder", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { name: "Sarah Williams", role: "CTO", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Mike Chen", role: "Lead Developer", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d" },
    { name: "Emily Davis", role: "UI/UX Designer", avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d" },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""} bg-background text-foreground`}>
      {/* Navbar */}
      <Navbar
        isBordered
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className="backdrop-blur-md"
        maxWidth="xl"
      >
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarContent className="sm:hidden pr-3" justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit text-xl">🚀 SVERI Tech</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit text-xl mr-8">🚀 SVERI Tech</p>
          </NavbarBrand>
          {menuItems.map((item) => (
            <NavbarItem key={item}>
              <Link color="foreground" href={`#${item.toLowerCase()}`} className="hover:text-primary transition-colors">
                {item}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Switch
              size="sm"
              color="secondary"
              isSelected={isDark}
              onValueChange={toggleTheme}
              thumbIcon={isDark ? <MoonIcon /> : <SunIcon />}
            />
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="#contact" variant="flat" radius="full">
              Get Started
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={item}>
              <Link
                className="w-full"
                color={index === 0 ? "primary" : "foreground"}
                href={`#${item.toLowerCase()}`}
                size="lg"
              >
                {item}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-success/10 pointer-events-none" />
        <motion.div
          className="max-w-6xl mx-auto px-6 py-24 md:py-40 text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <Chip color="secondary" variant="flat" size="lg" className="mb-6">
              🎉 Welcome to the Future
            </Chip>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          >
            Build Something{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-success bg-clip-text text-transparent">
              Extraordinary
            </span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-default-500 max-w-2xl mx-auto mb-10">
            Empowering innovators with cutting-edge tools and technology. Create, collaborate, and conquer the digital
            world with SVERI Tech.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
            <Button color="primary" size="lg" radius="full" variant="shadow" className="font-semibold px-8">
              Start Building →
            </Button>
            <Button color="default" size="lg" radius="full" variant="bordered" className="font-semibold px-8">
              Watch Demo ▶
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { label: "Active Users", value: "50K+" },
              { label: "Projects Built", value: "12K+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Countries", value: "80+" },
            ].map((stat) => (
              <Card key={stat.label} className="bg-default-50/50 backdrop-blur-sm">
                <CardBody className="text-center py-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-default-500 text-sm">{stat.label}</p>
                </CardBody>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <Divider className="max-w-6xl mx-auto" />

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Chip color="primary" variant="dot" className="mb-4">
              Features
            </Chip>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-default-500 max-w-xl mx-auto">
            Powerful features designed to help you build, deploy, and scale your applications effortlessly.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <Card
                isHoverable
                isPressable
                className="h-full border-transparent hover:border-primary/30 transition-all duration-300"
              >
                <CardHeader className="flex gap-3">
                  <div className="text-3xl">{feature.icon}</div>
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold">{feature.title}</p>
                    <Chip size="sm" color={feature.color} variant="flat">
                      {feature.color}
                    </Chip>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-default-500">{feature.description}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Divider className="max-w-6xl mx-auto" />

      {/* About Section */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <Card className="overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                alt="Team collaboration"
                className="w-full h-80 object-cover"
                radius="none"
              />
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Chip color="success" variant="dot" className="mb-4">
              About Us
            </Chip>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              We're on a Mission to{" "}
              <span className="text-primary">Transform Technology</span>
            </h2>
            <p className="text-default-500 mb-4">
              At SVERI Tech, we believe technology should empower everyone. Our team of passionate developers,
              designers, and innovators work tirelessly to create solutions that make a difference.
            </p>
            <p className="text-default-500 mb-6">
              Founded during the SVERI Hackathon, we've grown into a community-driven platform that helps
              thousands of developers bring their ideas to life.
            </p>
            <div className="flex gap-3">
              <Button color="primary" variant="shadow" radius="full">
                Learn More
              </Button>
              <Button color="default" variant="light" radius="full">
                Our Story →
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <Divider className="max-w-6xl mx-auto" />

      {/* Team Section */}
      <section id="team" className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <Chip color="warning" variant="dot" className="mb-4">
              Our Team
            </Chip>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-4">
            Meet the Creators
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-default-500 max-w-xl mx-auto">
            The brilliant minds behind SVERI Tech who make the magic happen every day.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {team.map((member) => (
            <motion.div key={member.name} variants={fadeInUp}>
              <Card isHoverable className="text-center">
                <CardBody className="items-center py-8">
                  <Tooltip content={member.role} color="primary">
                    <Avatar src={member.avatar} className="w-24 h-24 mb-4" isBordered color="primary" />
                  </Tooltip>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-default-500 text-sm">{member.role}</p>
                </CardBody>
                <CardFooter className="justify-center gap-2 pb-6">
                  <Button isIconOnly size="sm" variant="flat" color="default" radius="full">
                    🐦
                  </Button>
                  <Button isIconOnly size="sm" variant="flat" color="default" radius="full">
                    💼
                  </Button>
                  <Button isIconOnly size="sm" variant="flat" color="default" radius="full">
                    🐙
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Divider className="max-w-6xl mx-auto" />

      {/* Contact Section */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          className="grid md:grid-cols-2 gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <Chip color="danger" variant="dot" className="mb-4">
              Contact
            </Chip>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Let's Build <span className="text-primary">Together</span>
            </h2>
            <p className="text-default-500 mb-8">
              Have a project in mind? Want to collaborate? We'd love to hear from you. Drop us a message and we'll
              get back to you within 24 hours.
            </p>
            <div className="space-y-4">
              {[
                { icon: "📍", text: "SVERI Campus, Pandharpur, Maharashtra" },
                { icon: "📧", text: "hello@sveritech.dev" },
                { icon: "📞", text: "+91 98765 43210" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-default-600">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-2">
              <CardBody className="gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" placeholder="John" variant="bordered" radius="lg" />
                  <Input label="Last Name" placeholder="Doe" variant="bordered" radius="lg" />
                </div>
                <Input label="Email" placeholder="john@example.com" type="email" variant="bordered" radius="lg" />
                <Input label="Subject" placeholder="Project Inquiry" variant="bordered" radius="lg" />
                <Textarea
                  label="Message"
                  placeholder="Tell us about your project..."
                  variant="bordered"
                  radius="lg"
                  minRows={4}
                />
                <Button color="primary" size="lg" radius="full" variant="shadow" className="w-full font-semibold">
                  Send Message 🚀
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-default-50 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl font-bold mb-4">🚀 SVERI Tech</h3>
              <p className="text-default-500 text-sm">
                Empowering the next generation of innovators and builders.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Docs", "Changelog"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link color="foreground" href="#" size="sm" className="text-default-500 hover:text-primary">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Divider />
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
            <p className="text-default-500 text-sm">
              © 2024 SVERI Tech. Built with ❤️ at SVERI Hackathon.
            </p>
            <div className="flex gap-3">
              <Button isIconOnly size="sm" variant="flat" radius="full">🐦</Button>
              <Button isIconOnly size="sm" variant="flat" radius="full">🐙</Button>
              <Button isIconOnly size="sm" variant="flat" radius="full">💼</Button>
              <Button isIconOnly size="sm" variant="flat" radius="full">📸</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
