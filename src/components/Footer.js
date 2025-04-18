import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase"; // adjust path as needed

// Main component that renders all three modals
export default function FooterModals() {
  const [activeModal, setActiveModal] = useState(null);
  const modalRef = useRef(null);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    }

    // Add event listener if modal is open
    if (activeModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeModal]);

  return (
    <div className="font-sans">
      {/* Footer */}
      <footer className="bg-gray-800 py-6 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-3xl font-extrabold">X</span>
              <span className="text-white text-lg font-medium">penseTracker</span>
            </div>
           <div className="text-gray-400 text-sm">
  © {new Date().getFullYear()} XpenseTracker. All rights reserved by Decent Tech
</div>

            <div className="flex space-x-4 mt-4 md:mt-0">
              <button 
                onClick={() => openModal('privacy')} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => openModal('terms')} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => openModal('contact')} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Backdrop */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
          {/* Privacy Policy Modal */}
          {activeModal === 'privacy' && (
            <div ref={modalRef}>
              <ModalContainer title="Privacy Policy" onClose={closeModal}>
                <PrivacyContent />
              </ModalContainer>
            </div>
          )}

          {/* Terms of Service Modal */}
          {activeModal === 'terms' && (
            <div ref={modalRef}>
              <ModalContainer title="Terms of Service" onClose={closeModal}>
                <TermsContent />
              </ModalContainer>
            </div>
          )}

          {/* Contact Modal */}
          {activeModal === 'contact' && (
            <div ref={modalRef}>
              <ModalContainer title="Contact Us" onClose={closeModal}>
                <ContactForm onClose={closeModal} />
              </ModalContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable Modal Container
function ModalContainer({ title, children, onClose }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-auto text-gray-200 border border-gray-700">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// Privacy Policy Content
function PrivacyContent() {
  return (
    <div className="space-y-4 text-gray-300">
    <h3 className="text-lg font-semibold text-white">
  Effective Date: {new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
</h3>

      
      <p>
        At XpenseTracker, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our expense tracking service.
      </p>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Information We Collect</h3>
      <p>
        We collect information that you provide directly to us when you:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Create an account and user profile</li>
        <li>Enter expense and income data</li>
        <li>Connect financial accounts (with your permission)</li>
        <li>Contact customer support</li>
        <li>Respond to surveys or promotions</li>
      </ul>
      
      <h3 className="text-lg font-semibold mt-6 text-white">How We Use Your Information</h3>
      <p>
        We use the information we collect to:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Provide, maintain, and improve our services</li>
        <li>Process and complete transactions</li>
        <li>Send you technical notices and support messages</li>
        <li>Respond to your comments and questions</li>
        <li>Develop new products and services</li>
        <li>Generate anonymized, aggregate insights about financial behaviors</li>
      </ul>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Data Storage and Security</h3>
      <p>
        Your financial data is encrypted both in transit and at rest. We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.
      </p>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Your Rights</h3>
      <p>
        Depending on your location, you may have rights to:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Object to our processing of your data</li>
        <li>Export your data in a portable format</li>
      </ul>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Changes to This Policy</h3>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.
      </p>
    </div>
  );
}

// Terms of Service Content
function TermsContent() {
  return (
    <div className="space-y-4 text-gray-300"><h3 className="text-lg font-semibold text-white">
  Effective Date: {new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
</h3>

      
      <p>
        Welcome to XpenseTracker. By accessing or using our service, you agree to be bound by these Terms of Service.
      </p>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Account Registration</h3>
      <p>
        To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.
      </p>
      
      <h3 className="text-lg font-semibold mt-6 text-white">User Responsibilities</h3>
      <p>
        You are responsible for:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Maintaining the confidentiality of your account credentials</li>
        <li>All activities that occur under your account</li>
        <li>Ensuring that your use of the Service complies with all applicable laws</li>
        <li>Regularly backing up your data</li>
      </ul>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Subscription and Billing</h3>
      <p>
        Some features of XpenseTracker require a paid subscription. By subscribing to a paid plan:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>You authorize us to charge the payment method you provide</li>
        <li>Subscriptions automatically renew unless canceled before the renewal date</li>
        <li>Refunds are provided according to our Refund Policy</li>
      </ul>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Intellectual Property</h3>
      <p>
        All content, features, and functionality of the Service are owned by XpenseTracker and are protected by copyright, trademark, and other intellectual property laws.
      </p>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Limitation of Liability</h3>
      <p>
        XpenseTracker shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
      </p>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Termination</h3>
      <p>
        We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
      </p>
      
      <h3 className="text-lg font-semibold mt-6 text-white">Changes to Terms</h3>
      <p>
        We may modify these Terms at any time. If we make material changes, we will provide notice through the Service or by other means.
      </p>
    </div>
  );
}

// Contact Form
function ContactForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
  
    try {
      await addDoc(collection(db, "contacts"), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        createdAt: new Date(),
      });
  
      setStatus("success");
  
      // Reset form and close modal
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error saving contact:", error.message);
      setStatus("error");
    }
  };
  
  return (
    <div className="space-y-4 text-gray-300 w-full">
      {status === "success" ? (
        <div className="text-center py-8">
          <div className="mx-auto bg-green-900 text-green-300 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
          <p className="text-gray-300">We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-white"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-white"
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-white"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-white"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md shadow-sm hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === "sending"}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white rounded-md shadow-sm hover:opacity-90 disabled:opacity-75"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}