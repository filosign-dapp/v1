import { motion } from 'motion/react'
import { Shield, Lock, Clock, ArrowRight, Upload, Share2, Download } from 'lucide-react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { useNavigate } from '@tanstack/react-router'

export default function HomePage() {
  const navigate = useNavigate()

  const handleStartUpload = () => {
    navigate({ to: '/' })
  }

  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Your files are encrypted before leaving your device. We never see your data."
    },
    {
      icon: Clock,
      title: "Auto-Expiring Links",
      description: "Links automatically expire in 7 days for maximum security."
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Get a secure link instantly to share with anyone, anywhere."
    }
  ]

  const steps = [
    {
      icon: Upload,
      title: "Upload",
      description: "Drag & drop your file or click to browse"
    },
    {
      icon: Share2,
      title: "Share",
      description: "Get an encrypted link to share securely"
    },
    {
      icon: Download,
      title: "Download",
      description: "Recipients download with just one click"
    }
  ]

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-16 mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 space-y-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-6xl font-bold text-foreground">Portal</h1>
          </div>
          
          <h2 className="max-w-4xl mx-auto text-3xl font-semibold md:text-4xl text-foreground">
            Secure file sharing made <span className="text-primary">simple</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Share files securely with end-to-end encryption. No sign-ups, no tracking, 
            just pure privacy-focused file sharing.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              onClick={handleStartUpload}
              variant={"primary"}
              size="lg"
              className="px-8 py-6 text-base rounded-md"
            > 
              Start Sharing Securely
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid gap-8 mb-16 md:grid-cols-3"
        >
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center">
              <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-12 text-center"
        >
          <h3 className="text-3xl font-bold text-foreground">How it works</h3>
          
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="space-y-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold">{step.title}</h4>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 space-y-6 text-center"
        >
          <Card className="p-8 bg-muted/30">
            <h3 className="mb-4 text-2xl font-bold">Ready to share securely?</h3>
            <p className="max-w-lg mx-auto mb-6 text-muted-foreground">
              Join thousands of users who trust Portal for their secure file sharing needs.
            </p>
            <Button
              onClick={handleStartUpload}
              variant={"primary"}
              size="lg"
              className="px-8 py-6 text-base rounded-md"
            >
              Upload Your First File
              <Upload className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-12 text-sm text-muted-foreground"
        >
          <Shield className="w-4 h-4" />
          <span>🔒 Zero-knowledge encryption • 🕒 Auto-expiring links • 🚫 No data collection</span>
        </motion.div>
      </div>
    </div>
  )
}