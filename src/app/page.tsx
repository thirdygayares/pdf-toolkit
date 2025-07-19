"use client"

import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { ToolsCatalog } from "@/components/ToolsCatalog"
import { AboutSection } from "@/components/AboutSection"
import { FAQSection } from "@/components/FAQSection"
import { Footer } from "@/components/Footer"

const HomePage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <HeroSection />
                <ToolsCatalog />
                <AboutSection />
                <FAQSection />
            </main>
            <Footer />
        </div>
    )
}

export default HomePage
