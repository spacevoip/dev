import React from 'react';
import Navbar from '../components/Navbar';
import ContactHero from '../components/contact/ContactHero';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-secondary/90">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-5 mix-blend-overlay"></div>
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <ContactHero />
        <div className="grid md:grid-cols-2 gap-12 mt-16">
          <ContactForm />
          <ContactInfo />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;