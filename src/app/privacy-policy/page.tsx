import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
                    <div className="prose prose-lg max-w-none">
                        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We are committed to protecting your privacy. Our PDF tools process files locally in your browser
                                whenever possible, and we do not store your documents on our servers.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Any files you upload are processed solely for the purpose of providing the requested PDF operations.
                                Files are automatically deleted after processing is complete.
                            </p>
                        </section>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default PrivacyPolicyPage
