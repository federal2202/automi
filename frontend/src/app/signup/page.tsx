'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/shared/Button'
import { cn } from '@/utils/cn'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function SignupPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Clear general auth error
    if (error) {
      clearError()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      })

      if (success) {
        // Redirect to dashboard on successful registration
        router.push('/dashboard')
      }
    } catch (err) {
      // Error is handled by the useAuth hook
      console.error('Registration error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display">
            Create Account
          </h1>
          <p className="text-muted-foreground text-base">
            Join NotebookLM to get started with your personal AI assistant
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#ffffff]/2 backdrop-blur-sm border border-[#ffffff]/10 rounded-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange('name')}
                className={cn(
                  "h-12 bg-input/50 border-input/50 text-white placeholder:text-muted-foreground focus:border-green-nice focus:ring-1 focus:ring-green-nice transition-colors",
                  errors.name && "border-destructive focus:border-destructive focus:ring-destructive"
                )}
                disabled={isFormLoading}
              />
              {errors.name && (
                <p className="text-destructive text-sm font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className={cn(
                  "h-12 bg-input/50 border-input/50 text-white placeholder:text-muted-foreground focus:border-green-nice focus:ring-1 focus:ring-green-nice transition-colors",
                  errors.email && "border-destructive focus:border-destructive focus:ring-destructive"
                )}
                disabled={isFormLoading}
              />
              {errors.email && (
                <p className="text-destructive text-sm font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange('password')}
                className={cn(
                  "h-12 bg-input/50 border-input/50 text-white placeholder:text-muted-foreground focus:border-green-nice focus:ring-1 focus:ring-green-nice transition-colors",
                  errors.password && "border-destructive focus:border-destructive focus:ring-destructive"
                )}
                disabled={isFormLoading}
              />
              {errors.password && (
                <p className="text-destructive text-sm font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                className={cn(
                  "h-12 bg-input/50 border-input/50 text-white placeholder:text-muted-foreground focus:border-green-nice focus:ring-1 focus:ring-green-nice transition-colors",
                  errors.confirmPassword && "border-destructive focus:border-destructive focus:ring-destructive"
                )}
                disabled={isFormLoading}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* General Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-destructive text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isFormLoading}
                className={cn(
                  "w-full h-12 bg-green-nice text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none",
                  isFormLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isFormLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="text-green-nice hover:text-green-400 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}