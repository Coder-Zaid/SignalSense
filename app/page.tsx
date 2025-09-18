"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Camera, Shield, Signal, Truck, Zap, BarChart3, Mail, Github, Linkedin } from "lucide-react"

export default function SmartTrafficSystem() {
  const [trafficSignal, setTrafficSignal] = useState("red")
  const [congestionReduction, setCongestionReduction] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const [mobilityImprovement, setMobilityImprovement] = useState(0)

  // Traffic signal animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficSignal((prev) => {
        if (prev === "red") return "yellow"
        if (prev === "yellow") return "green"
        return "red"
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Counter animations for impact metrics
  useEffect(() => {
    const timer1 = setInterval(() => {
      setCongestionReduction((prev) => (prev < 30 ? prev + 1 : 30))
    }, 50)
    const timer2 = setInterval(() => {
      setResponseTime((prev) => (prev < 40 ? prev + 1 : 40))
    }, 60)
    const timer3 = setInterval(() => {
      setMobilityImprovement((prev) => (prev < 25 ? prev + 1 : 25))
    }, 70)

    return () => {
      clearInterval(timer1)
      clearInterval(timer2)
      clearInterval(timer3)
    }
  }, [])
  
  // Navigate to comparison page
  const navigateToComparison = () => {
    window.location.href = '/comparison.html';
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="Signal Sense Logo" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold">Signal Sense</span>
            </div>
            <div className="hidden md:flex space-x-4">
              <a
                href="/simulation"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-1"
              >
                <Signal className="h-4 w-4" />
                Try Simulation
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Animated Traffic Signal */}
              <div className="w-16 h-40 bg-card rounded-lg shadow-lg p-2 flex flex-col items-center justify-around">
                <div
                  className={`w-10 h-10 rounded-full transition-all duration-500 ${
                    trafficSignal === "red" ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`w-10 h-10 rounded-full transition-all duration-500 ${
                    trafficSignal === "yellow" ? "bg-yellow-500 shadow-lg shadow-yellow-500/50" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`w-10 h-10 rounded-full transition-all duration-500 ${
                    trafficSignal === "green" ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-gray-300"
                  }`}
                />
              </div>
              {/* AI Brain Pulse Effect */}
              <div className="absolute -top-4 -right-4">
                <div className="relative">
                  <Brain className="h-8 w-8 text-primary animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">Signal Sense</h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-primary">AI-Powered Traffic Management</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
            AI-powered solution to reduce congestion and save lives
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4">
              Learn More
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-transparent" asChild>
              <a href="/comparison.html">
                <Signal className="h-5 w-5 mr-2" />
                Try Simulation Lab
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Smart India Hackathon 2025
            </Badge>
            <h2 className="text-4xl font-bold mb-6">About the Project</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              This project is developed for Smart India Hackathon 2025 (Problem ID: 25050). We're tackling urban
              congestion with an AI-powered Smart Signal System combined with Emergency Vehicle Priority System (EVPS)
              to create smarter, safer cities.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-accent/5">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Signal className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Signal System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI dynamically adjusts signal timings using real-time traffic & IoT data for optimal flow.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>EVPS System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatically clears routes for ambulances & fire trucks, reducing emergency response time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Data Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time monitoring dashboard with traffic predictions and congestion analytics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Scalable Design</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Modular architecture that can be implemented in any urban city with existing infrastructure.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                icon: Camera,
                title: "Data Collection",
                desc: "IoT sensors & cameras collect real-time traffic data",
              },
              {
                step: 2,
                icon: Brain,
                title: "AI Analysis",
                desc: "AI analyzes congestion patterns & predicts bottlenecks",
              },
              { step: 3, icon: Signal, title: "Signal Adjustment", desc: "Dynamic traffic signal timing optimization" },
              {
                step: 4,
                icon: Shield,
                title: "Emergency Priority",
                desc: "Green corridor creation for emergency vehicles",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    {item.step}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-foreground/80 text-pretty">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-4 bg-accent/5">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Expected Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold text-primary mb-2">{congestionReduction}%</div>
                <h3 className="text-xl font-semibold mb-2">Congestion Reduction</h3>
                <p className="text-muted-foreground">
                  Significant decrease in urban traffic congestion through intelligent signal management
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold text-primary mb-2">{responseTime}%</div>
                <h3 className="text-xl font-semibold mb-2">Faster Emergency Response</h3>
                <p className="text-muted-foreground">
                  Reduced emergency vehicle response time through priority routing
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold text-primary mb-2">{mobilityImprovement}%</div>
                <h3 className="text-xl font-semibold mb-2">Improved Mobility</h3>
                <p className="text-muted-foreground">Enhanced urban mobility and reduced environmental pollution</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Md. Zaid (Mohammed Zaid)", role: "Team Lead & Full Stack Developer", avatar: "/md.zaid.jpg" },
              { name: "Mohammad Saalim", role: "Backend Developer", avatar: "/Saalim.jpg" },
              { name: "Shaikh Arsh Ali", role: "AI/ML Engineer", avatar: "/Arsh.jpg" },
              { name: "Prabheesh Singh", role: "Graphic Designer", avatar: "/prabheesh singh.jpg" },
              { name: "Rayan Faheem Shaik", role: "Creative Director", avatar: "/Rayan Faheem Shaikh.jpg" },
              { name: "M S Chethana", role: "Speaker & Presenter", avatar: "/chetana.jpeg" },
            ].map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <img
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-accent/5">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold text-center mb-12">Get In Touch</h2>
          <Card>
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input type="email" placeholder="yourteam@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea placeholder="Tell us about your project or ask questions..." rows={4} />
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.jpg" alt="Signal Sense Logo" className="h-10 w-10 rounded-full" />
                <span className="text-xl font-bold">Signal Sense</span>
              </div>
              <p className="text-primary-foreground/80">
                Smart traffic management solutions powered by AI for smarter cities.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>
                  <a href="#about" className="hover:text-primary-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-primary-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#impact" className="hover:text-primary-foreground transition-colors">
                    Impact
                  </a>
                </li>
                <li>
                  <a href="#team" className="hover:text-primary-foreground transition-colors">
                    Team
                  </a>
                </li>
                <li>
                  <a href="/lab" className="hover:text-primary-foreground transition-colors">
                    Lab
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Github className="h-5 w-5 text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors" />
                <Linkedin className="h-5 w-5 text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors" />
                <Mail className="h-5 w-5 text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2025 Signal Sense. Built for Smart India Hackathon 2025.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
