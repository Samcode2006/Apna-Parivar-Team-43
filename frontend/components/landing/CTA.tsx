'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const CTA = () => {
  return (
    <section id='contact' className='py-20 sm:py-32 bg-background px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* CTA Card */}
        <div className='bg-card/10 border border-border/50 rounded-3xl p-8 sm:p-12 lg:p-16 text-center space-y-8'>
          
          {/* Content */}
          <div className='space-y-4'>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight'>
              Launch your family&apos;s secure space — in minutes
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Create a family profile, define Admin1/Admin2/Admin3 roles, add members with programmable fields, and invite relatives using Gmail-only authentication. Built to scale with multiple families under one platform.
            </p>
          </div>

          {/* Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center pt-8'>
            <Link
              href='/login'
              className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition duration-200 hover:shadow-lg hover:shadow-primary/20'
            >
              Get Started (Gmail only)
              <ArrowRight size={20} />
            </Link>
            <Link
              href='#features'
              className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-foreground font-semibold rounded-lg border border-border hover:bg-accent/50 transition duration-200'
            >
              Learn More
            </Link>
          </div>

          {/* Footer Note */}
          <p className='text-sm text-muted-foreground pt-4'>
            No credit card required • Free forever plan available
          </p>
        </div>
      </div>
    </section>
  )
}

export default CTA
