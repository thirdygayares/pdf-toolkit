"use client"

import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { ToolsCatalog } from "@/components/ToolsCatalog"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { SecurityCalloutSection } from "@/components/SecurityCalloutSection"
import { FAQSection } from "@/components/FAQSection"
import { Footer } from "@/components/Footer"

const HomePage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <HeroSection />
                <ToolsCatalog />
                <HowItWorksSection />
                <SecurityCalloutSection />
                <FAQSection />
            </main>
            <Footer />
        </div>
    )
}

export default HomePage
