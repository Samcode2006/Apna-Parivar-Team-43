'use client'
import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Globe } from '../ui/globe'

const Hero = () => {
  return (
  <section id='home' className='min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20'>
      <div className='max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        
        {/* Left Content */}
        <div className='space-y-6 lg:space-y-8 z-10'>
          <div className='space-y-4'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight'>
              Model, Protect and Share Your Family
              <span className='text-foreground'> the easy way</span>
            </h1>
            <p className='text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl'>
              Represent family relationships (parents, siblings, cousins, in-laws, step & twin relations) with simple, structured entry. Use Gmail-only authentication, role-based admins, programmable fields per person and fast name/keyword search — all under one secure, multi-family system.
            </p>
          </div>
          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 pt-4'>
            <a
              href='/login'
              className='inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition duration-200 hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto'
            >
              Get Started (Gmail only)
              <ArrowRight size={20} />
            </a>
            <a
              href='#features'
              className='inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-foreground font-semibold rounded-lg border border-border hover:bg-accent/50 transition duration-200 w-full sm:w-auto'
            >
              Learn More
            </a>
          </div>
          {/* Trust Badges */}
          <div className='pt-8 space-y-3 text-sm text-muted-foreground'>
            <p>✓ Secure & Private</p>
            <p>✓ Easy to Use</p>
            <p>✓ Built for Families</p>
          </div>
        </div>
        {/* Right Content - Globe */}
        <div className='hidden lg:flex items-center justify-center relative z-0'>
          <div className='w-full h-[800px] flex items-center justify-center relative'>
            {/* subtle glow/background for the globe */}
            <div className='w-[520px] h-[520px] bg-white/5 rounded-full blur-3xl absolute'></div>
            {/* Increase globe max size on large screens */}
            <Globe className='max-w-[720px] w-full relative z-10' />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero