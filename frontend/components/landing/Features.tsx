'use client'

import React from 'react'
import { Users, Heart, Share2, Lock, Zap, Calendar } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Users,
      title: 'Simple Family Modeling',
      description: 'Add members with relationship labels (father, mother, siblings, step/twin, uncles/aunts, cousins) so building a full family tree is straightforward.',
      color: 'bg-white/10'
    },
    {
      icon: Heart,
      title: 'Programmable Fields',
      description: 'Each person can have up to 10 custom fields (phone, DOB, story, location, etc.) configurable by the family owner.',
      color: 'bg-white/10'
    },
    {
      icon: Share2,
      title: 'Role-based Admins',
      description: 'Designate Admin1 (family owner), Admin2 and Admin3. Only admins can add members, photos and edit details.',
      color: 'bg-white/10'
    },
    {
      icon: Lock,
      title: 'Gmail-only Authentication',
      description: 'Secure authentication using Gmail accounts only — simplifies onboarding and ties identities to email addresses.',
      color: 'bg-white/10'
    },
    {
      icon: Zap,
      title: 'Multi-family Support',
      description: 'SuperAdmin can create and manage multiple families within a single hosted application.',
      color: 'bg-white/10'
    },
    {
      icon: Calendar,
      title: 'Search & Discovery',
      description: 'Fast search by name and keywords lets you find people, notes or photos across entire family networks.',
      color: 'bg-white/10'
    }
  ]

  return (
    <section id='features' className='py-20 sm:py-32 bg-background px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16 sm:mb-20'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground'>
            Powerful Features
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Everything you need to stay connected with your family and preserve your shared stories.
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className='group bg-primary/5 border border-border rounded-2xl p-6 sm:p-8 hover:border-border/40 hover:bg-primary/10 transition-all duration-300 hover:shadow-xl'
              >
                {/* Icon */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-all`}>
                  <Icon size={28} className='text-foreground' />
                </div>

                {/* Content */}
                <h3 className='text-xl font-semibold text-foreground mb-3'>
                  {feature.title}
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
