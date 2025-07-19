import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const TermsOfServicePage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
                    <div className="prose prose-lg max-w-none">
                        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By using our PDF tools, you agree to these terms of service. Please read them carefully before using our
                                services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Services</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our tools are provided free of charge for personal and commercial use. You are responsible for ensuring
                                you have the right to process any files you upload.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitations</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We provide these tools "as is" without warranties. We are not liable for any data loss or damages
                                resulting from the use of our services.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default TermsOfServicePage
