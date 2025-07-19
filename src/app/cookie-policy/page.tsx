import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const CookiePolicyPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
                    <div className="prose prose-lg max-w-none">
                        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">What Are Cookies</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Cookies are small text files that are stored on your device when you visit our website. They help us
                                provide you with a better experience.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Cookies</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use cookies to remember your preferences and improve the functionality of our tools. We do not use
                                cookies for advertising purposes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Managing Cookies</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You can control and delete cookies through your browser settings. However, disabling cookies may affect
                                the functionality of our tools.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default CookiePolicyPage
