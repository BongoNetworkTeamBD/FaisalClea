import { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  HardDrive,
  Monitor,
  Trash2,
  FileText,
  User,
  Star,
  CheckCircle,
  DollarSign,
  Lock,
  Settings,
  ChevronDown,
  User as UserIcon,
  Code as CodeIcon,
  Download,
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';

// Get Firebase configuration and other necessary variables from the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// This is a placeholder UID for the admin user. Replace with your actual Firebase Auth UID.
const ADMIN_UID = '09800983331236749282'; 

const App = () => {
  // Define color palette
  const colors = {
    bg: '#18181c',
    panel: '#202026',
    text: '#ffffff',
    nameGreen: '#00ff00',
  };

  // State to manage app functionality
  const [currentPage, setCurrentPage] = useState('main'); // 'main', 'login', 'admin', 'profile', 'redeem'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading', 'authenticated', 'unauthenticated'
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Use useInView hook for scroll animations
  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: featuresRef, inView: featuresInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: testimonialsRef, inView: testimonialsInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: pricingRef, inView: pricingInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: faqRef, inView: faqInView } = useInView({ triggerOnce: true, threshold: 0.2 });

  // Helper function to check if premium status is active
  const isPremiumActive = (profile) => {
    if (!profile?.isPremium) {
      return false;
    }
    // Lifetime premium has premiumExpires as null
    if (profile.premiumExpires === null) {
      return true;
    }
    // Check if the expiration date is in the future
    return profile.premiumExpires && profile.premiumExpires.toDate() > new Date();
  };

  // Handle Firebase Auth and Firestore setup
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setAuthStatus('authenticated');
        // Fetch or create user profile from Firestore using the correct path
        // This path is designed to work with the Canvas environment's security rules
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          // Create new user profile if it doesn't exist
          const newProfile = {
            isPremium: false,
            premiumExpires: null,
            isAdmin: user.uid === ADMIN_UID, // Check if the current user is the admin
            createdAt: new Date(),
            customRewardMessage: null, // New field for custom rewards
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setAuthStatus('unauthenticated');
        setUserId(null);
        setUserProfile(null);
      }
    });

    const signInUser = async () => {
      const initialToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
      try {
        if (initialToken) {
          await signInWithCustomToken(auth, initialToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Firebase sign-in error:', error);
      }
    };
    signInUser();

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
    };
  }, []);

  // Helper function to handle smooth scrolling
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); // Close menu after clicking a link
  };

  const navLinks = [
    { name: 'Features', id: 'features' },
    { name: 'Testimonials', id: 'testimonials' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Contact', id: 'contact' },
  ];

  const features = [
    {
      icon: HardDrive,
      title: 'Clean Temporary Files',
      description: 'Quickly and safely remove temporary files from your system to free up valuable disk space.',
    },
    {
      icon: Monitor,
      title: 'Clear Browser Cache',
      description: 'Erase cached files from all major browsers, including Chrome, Edge, and Firefox, to protect your privacy.',
    },
    {
      icon: FileText,
      title: 'Clear Prefetch',
      description: 'Delete unnecessary Prefetch files to improve system startup and application loading times.',
    },
    {
      icon: Zap,
      title: 'Optimize Windows Update',
      description: 'Clean out the Windows Update cache to fix update issues and regain storage.',
    },
    {
      icon: Trash2,
      title: 'Empty Recycle Bin',
      description: 'A quick way to permanently remove all items from your Recycle Bin.',
    },
    {
      icon: CheckCircle,
      title: 'One-Click Cleaning',
      description: 'The "Clean Everything" button performs a comprehensive system cleanup with a single click.',
    },
  ];

  const testimonials = [
    { name: 'User One', text: 'This cleaner is a game-changer! My old laptop feels brand new. Simple, fast, and effective.', stars: 5 },
    { name: 'User Two', text: 'I was skeptical, but this tool completely cleaned out my junk files. Highly recommended!', stars: 5 },
    { name: 'User Three', text: 'The one-click cleaning feature is a lifesaver. It saves me so much time and my PC runs so much smoother.', stars: 5 },
  ];

  const faqs = [
    { question: 'Is this tool safe to use?', answer: 'Yes, the PC Cleaner is designed to safely remove only non-essential files, ensuring your important data remains untouched.' },
    { question: 'What browsers does it support?', answer: 'Our cleaner supports all major browsers, including Google Chrome, Microsoft Edge, and Mozilla Firefox.' },
    { question: 'Do I need admin rights to run it?', answer: 'Yes, the tool requires administrator permissions to clean certain system-level files like Windows Update cache and temporary folders.' },
    { question: 'Is it really free?', answer: 'Yes, this version is completely free to use. We are a part of the Bongo Network Team and believe in providing useful tools to the community.' },
  ];

  const pricingPlans = [
    { duration: '1 Month', price: '$1.50', description: 'Perfect for a one-time deep clean or short-term performance boost.', features: ['Full PC cleaning suite', 'Browser cache clearing', 'Temp file removal', 'Recycle bin emptying'] },
    { duration: '6 Months', price: '$7.50', description: 'Our most popular plan, offering sustained performance and savings.', features: ['All features of the 1-month plan', 'Discounted price', 'Automatic scheduled cleaning', 'Priority email support'] },
    { duration: 'Lifetime', price: '$25.00', description: 'The best value for long-term, worry-free PC maintenance.', features: ['All features of the 6-month plan', 'Maximum savings', 'Exclusive early access to new features', '24/7 VIP support'] },
  ];

  const StarRating = ({ count }) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={18} fill="currentColor" className={`mr-1 ${i < count ? '' : 'text-gray-600'}`} />
      ))}
    </div>
  );

  const renderContent = () => {
    if (authStatus === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (currentPage === 'login') {
      return <LoginPage setCurrentPage={setCurrentPage} authStatus={authStatus} userId={userId} userProfile={userProfile} isPremiumActive={isPremiumActive} />;
    }

    if (currentPage === 'admin' && userProfile?.isAdmin) {
      return <AdminPanel />;
    }

    if (currentPage === 'profile' && userId) {
      return <ProfilePage setCurrentPage={setCurrentPage} userId={userId} userProfile={userProfile} isPremiumActive={isPremiumActive} />;
    }
    
    if (currentPage === 'redeem' && userId) {
        return <RedeemPage setCurrentPage={setCurrentPage} userId={userId} setUserProfile={setUserProfile} />;
    }

    return (
      <main className="pt-16">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className={`flex flex-col md:flex-row items-center justify-center text-center md:text-left min-h-[calc(100vh-64px)] px-4 py-20 bg-center bg-cover bg-no-repeat transition-all duration-1000 ${
            heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1549683648-73595d036130?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundBlendMode: 'multiply',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="max-w-xl mx-auto md:mx-0">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-green-300">
              <span style={{ color: colors.nameGreen }}>Faisal's</span> PC Cleaner
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-gray-300 font-medium">
              Supercharge your PC's performance with a single click.
            </p>
            <p className="mt-2 text-lg text-gray-400">
              Developed by the Bongo Network Team.
            </p>
            <a
              href="https://t.me/MrFaisalAhmed"
              className="mt-8 inline-flex items-center px-8 py-4 text-xl font-bold rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <DollarSign className="mr-3 h-6 w-6 group-hover:animate-bounce" />
              Buy Now
            </a>
            {isPremiumActive(userProfile) && (
              <p className="mt-4 text-lg font-bold text-green-400">You are a Premium User!</p>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className={`py-20 px-4 md:px-8 transition-all duration-1000 ${
          featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Powerful Features, Simple Interface</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
              Our PC cleaner offers a suite of tools designed for maximum efficiency and ease of use.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-8 rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center border-2 border-transparent hover:border-green-500"
                >
                  <div className="bg-gray-900 p-4 rounded-full mb-6">
                    <feature.icon className="h-10 w-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" ref={testimonialsRef} className={`py-20 px-4 md:px-8 transition-all duration-1000 ${
          testimonialsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ backgroundColor: colors.panel }}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
              Hear from satisfied users who have experienced the benefits of a clean, fast PC.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center">
                  <div className="mb-4">
                    <User className="h-12 w-12 text-green-400" />
                  </div>
                  <StarRating count={testimonial.stars} />
                  <p className="italic text-gray-300 mt-4">"{testimonial.text}"</p>
                  <p className="mt-4 font-bold text-lg" style={{ color: colors.nameGreen }}>- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" ref={pricingRef} className={`py-20 px-4 md:px-8 transition-all duration-1000 ${
          pricingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
              Get the most out of your PC with our flexible subscription options.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center text-center border-2 border-transparent hover:border-green-500 transition-all duration-300 group"
                >
                  <div className="bg-gray-900 p-4 rounded-full mb-6">
                    <DollarSign className="h-10 w-10 text-green-400 group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">{plan.duration} Plan</h3>
                  <p className="text-4xl font-extrabold mb-4">{plan.price}</p>
                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                  <ul className="text-gray-300 mb-8 text-left space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://t.me/MrFaisalAhmed"
                    className="mt-auto px-8 py-3 rounded-full text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
                  >
                    Buy Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" ref={faqRef} className={`py-20 px-4 md:px-8 transition-all duration-1000 ${
          faqInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ backgroundColor: colors.panel }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((item, index) => (
                <details
                  key={index}
                  className="group bg-gray-800 rounded-xl p-6 transition-all duration-300 cursor-pointer"
                >
                  <summary className="flex justify-between items-center font-bold text-xl text-green-400 group-hover:text-green-500">
                    {item.question}
                    <ChevronDown className="transform transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="mt-4 text-gray-300 transition-all duration-300">
                    <p>{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  };

  // Helper components for pages
  const LoginPage = ({ setCurrentPage, authStatus, userId, userProfile, isPremiumActive }) => (
    <div className="flex items-center justify-center min-h-screen text-white p-4" style={{ backgroundColor: colors.bg }}>
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-green-400 mb-4">Login</h2>
        <p className="text-gray-300 mb-6">
          This demo uses anonymous sign-in. Your unique ID is generated automatically.
        </p>
        <p className="mb-4 text-sm break-all text-gray-400">
          <strong>Your User ID:</strong> {userId}
        </p>
        <button
          onClick={() => setCurrentPage('main')}
          className="w-full px-8 py-3 rounded-full text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
        >
          Go to Home
        </button>
        {userProfile?.isAdmin && (
          <button
            onClick={() => setCurrentPage('admin')}
            className="w-full mt-4 px-8 py-3 rounded-full text-white font-bold bg-blue-500 hover:bg-blue-600 transition-colors shadow-lg"
          >
            Go to Admin Panel
          </button>
        )}
        <button
          onClick={() => setCurrentPage('profile')}
          className="w-full mt-4 px-8 py-3 rounded-full text-white font-bold bg-gray-700 hover:bg-gray-600 transition-colors shadow-lg"
        >
          Go to Profile
        </button>
      </div>
    </div>
  );

  const AdminPanel = () => {
    const [targetUid, setTargetUid] = useState('');
    const [message, setMessage] = useState('');
    const [rewardType, setRewardType] = useState('plan'); // 'plan' or 'custom'
    const [planReward, setPlanReward] = useState('1m'); // Default plan reward
    const [customReward, setCustomReward] = useState(''); // Custom reward message
    const [redeemCodeLimit, setRedeemCodeLimit] = useState(5); // Default limit
    const [generatedCode, setGeneratedCode] = useState('');

    // Function to generate a random string and a random number
    const generateRandomCode = () => {
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        return `FAISAL-${randomString}-${randomNumber}`;
    };

    // Function to generate and save a new redeem code
    const generateRedeemCode = async () => {
        if (!redeemCodeLimit || redeemCodeLimit < 1) {
            setMessage('অনুগ্রহ করে একটি বৈধ সীমা দিন।');
            return;
        }

        let rewardValue = null;
        if (rewardType === 'plan') {
            rewardValue = planReward;
        } else if (rewardType === 'custom') {
            if (!customReward) {
                setMessage('অনুগ্রহ করে কাস্টম রিওয়ার্ড বার্তা দিন।');
                return;
            }
            rewardValue = customReward;
        }

        const newCode = generateRandomCode();
        setMessage(`Generating code: ${newCode}...`);
        
        try {
            const redeemCodesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'redeemCodes');
            await addDoc(redeemCodesCollection, {
                code: newCode,
                rewardType: rewardType,
                rewardValue: rewardValue,
                limit: parseInt(redeemCodeLimit),
                usedBy: [],
                createdAt: new Date(),
            });
            setGeneratedCode(newCode);
            setMessage(`সফলভাবে কোড তৈরি হয়েছে: ${newCode}.`);
        } catch (error) {
            console.error('Error generating redeem code:', error);
            setMessage('Error: Failed to generate redeem code.');
        }
    };

    // Function to grant premium access to a user
    const grantPremium = async (durationInMonths) => {
      if (!targetUid) {
        setMessage('Please enter a User ID.');
        return;
      }
      setMessage(`Granting ${durationInMonths === Infinity ? 'Lifetime' : `${durationInMonths} Month`} premium to user...`);
      try {
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', targetUid);
        let premiumExpires = null;
        if (durationInMonths !== Infinity) {
          const now = new Date();
          now.setMonth(now.getMonth() + durationInMonths);
          premiumExpires = now;
        }

        await updateDoc(userDocRef, { 
          isPremium: true,
          premiumExpires: premiumExpires,
        });

        setMessage(`Successfully granted ${durationInMonths === Infinity ? 'Lifetime' : `${durationInMonths} Month`} premium to user ${targetUid}!`);
        setTargetUid('');
      } catch (error) {
        console.error('Error updating user:', error);
        setMessage('Error: User not found or update failed.');
      }
    };
    
    // Function to set a user as an admin
    const makeUserAdmin = async () => {
        if (!targetUid) {
            setMessage('Please enter a User ID.');
            return;
        }
        setMessage(`Setting user ${targetUid} as an admin...`);
        try {
            const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', targetUid);
            await updateDoc(userDocRef, {
                isAdmin: true,
            });
            setMessage(`Successfully set user ${targetUid} as an admin!`);
            setTargetUid('');
        } catch (error) {
            console.error('Error making user admin:', error);
            setMessage('Error: User not found or update failed.');
        }
    };

    // Function to set a user's plan to free
    const setPlanToFree = async () => {
        if (!targetUid) {
            setMessage('Please enter a User ID.');
            return;
        }
        setMessage(`Setting user's plan to Free...`);
        try {
            const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', targetUid);
            await updateDoc(userDocRef, {
                isPremium: false,
                premiumExpires: null,
            });
            setMessage(`Successfully set user ${targetUid}'s plan to Free!`);
            setTargetUid('');
        } catch (error) {
            console.error('Error setting user plan to free:', error);
            setMessage('Error: User not found or update failed.');
        }
    };

    return (
      <div className="flex items-center justify-center min-h-screen text-white p-4" style={{ backgroundColor: colors.bg }}>
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">অ্যাডমিন প্যানেল</h2>
          <p className="text-gray-300 mb-6">
            এখানে আপনি ব্যবহারকারীদের প্রিমিয়াম অ্যাক্সেস দিতে, অ্যাডমিন বানাতে, অথবা রিডিম কোড তৈরি করতে পারবেন।
          </p>
          
          {/* User Management Section */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-blue-300 mb-4">ইউজার ম্যানেজমেন্ট</h3>
            <div className="mb-4">
                <input
                    type="text"
                    value={targetUid}
                    onChange={(e) => setTargetUid(e.target.value)}
                    placeholder="ইউজার আইডি (UID) দিন"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
                <button
                    onClick={() => grantPremium(1)}
                    className="w-full px-8 py-3 rounded-full text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
                >
                    ১ মাস
                </button>
                <button
                    onClick={() => grantPremium(6)}
                    className="w-full px-8 py-3 rounded-full text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
                >
                    ৬ মাস
                </button>
                <button
                    onClick={() => grantPremium(Infinity)}
                    className="w-full px-8 py-3 rounded-full text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
                >
                    লাইফটাইম
                </button>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
                <button
                    onClick={setPlanToFree}
                    className="w-full px-8 py-3 rounded-full text-white font-bold bg-yellow-500 hover:bg-yellow-600 transition-colors shadow-lg"
                >
                    প্ল্যান ফ্রি করুন
                </button>
                <button
                    onClick={makeUserAdmin}
                    className="w-full px-8 py-3 rounded-full text-white font-bold bg-purple-500 hover:bg-purple-600 transition-colors shadow-lg"
                >
                    অ্যাডমিন বানান
                </button>
            </div>
          </div>

          {/* Redeem Code Generation Section */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-blue-300 mb-4">রিডিম কোড তৈরি করুন</h3>
            <div className="mb-4 text-left">
                <label className="block text-gray-400 mb-2">রিওয়ার্ডের ধরণ:</label>
                <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="plan">প্রিমিয়াম প্ল্যান</option>
                    <option value="custom">কাস্টম রিওয়ার্ড</option>
                </select>
            </div>
            {rewardType === 'plan' ? (
                <div className="mb-4 text-left">
                    <label className="block text-gray-400 mb-2">প্ল্যান সেট করুন:</label>
                    <select
                        value={planReward}
                        onChange={(e) => setPlanReward(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="1m">১ মাস</option>
                        <option value="6m">৬ মাস</option>
                        <option value="lifetime">লাইফটাইম</option>
                    </select>
                </div>
            ) : (
                <div className="mb-4 text-left">
                    <label className="block text-gray-400 mb-2">কাস্টম রিওয়ার্ড বার্তা:</label>
                    <textarea
                        value={customReward}
                        onChange={(e) => setCustomReward(e.target.value)}
                        placeholder="এখানে কাস্টম রিওয়ার্ড লিখুন..."
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                    ></textarea>
                </div>
            )}
            
            <div className="mb-4 text-left">
                <label className="block text-gray-400 mb-2">ব্যবহারের সীমা (ডিফল্ট ৫):</label>
                <input
                    type="number"
                    value={redeemCodeLimit}
                    onChange={(e) => setRedeemCodeLimit(e.target.value)}
                    placeholder="সীমা"
                    min="1"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>
            <button
                onClick={generateRedeemCode}
                className="w-full px-8 py-3 rounded-full text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
            >
                কোড তৈরি করুন
            </button>
            {generatedCode && (
                <div className="mt-4 text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm text-green-300">তৈরি হয়েছে কোড:</p>
                    <p className="font-bold text-lg break-all">{generatedCode}</p>
                </div>
            )}
          </div>
          
          {message && (
            <div className="mt-4 text-center p-4 bg-gray-700 rounded-lg">
              <p className="text-sm text-green-300">{message}</p>
            </div>
          )}
          <button
            onClick={() => setCurrentPage('main')}
            className="w-full mt-4 px-8 py-3 rounded-full text-white font-bold bg-red-500 hover:bg-red-600 transition-colors shadow-lg"
          >
            হোম পেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  };

  const ProfilePage = ({ setCurrentPage, userId, userProfile, isPremiumActive }) => {
    // Function to get the user's plan status
    const getPlanStatus = () => {
      if (!userProfile || !userProfile.isPremium) {
        return { name: 'ফ্রি প্ল্যান', color: 'text-gray-400', expires: null };
      }
      if (userProfile.premiumExpires === null) {
        return { name: 'লাইফটাইম প্ল্যান', color: 'text-green-400', expires: 'কখনোই না' };
      }
      const expirationDate = userProfile.premiumExpires.toDate();
      const formattedDate = expirationDate.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return { name: 'প্রিমিয়াম প্ল্যান', color: 'text-green-400', expires: formattedDate };
    };

    const plan = getPlanStatus();
    
    return (
      <div className="flex items-center justify-center min-h-screen text-white p-4" style={{ backgroundColor: colors.bg }}>
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md w-full text-center">
          <UserIcon className="h-20 w-20 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">প্রোফাইল</h2>
          <p className="text-gray-400 mb-6">এখানে আপনি আপনার অ্যাকাউন্ট তথ্য দেখতে পারবেন।</p>
          
          <div className="text-left space-y-4">
            <div>
              <p className="text-lg font-semibold text-green-400">ইউজার আইডি (User ID):</p>
              <p className="mt-1 text-sm break-all text-gray-300">{userId}</p>
            </div>
            
            <div>
              <p className="text-lg font-semibold text-green-400">আপনার বর্তমান প্ল্যান:</p>
              <p className={`mt-1 text-xl font-bold ${plan.color}`}>{plan.name}</p>
              {plan.expires && (
                <p className="mt-2 text-sm text-gray-300">
                  মেয়াদ শেষ হবে: <span className="font-semibold text-green-300">{plan.expires}</span>
                </p>
              )}
            </div>

            {/* New section for custom rewards */}
            {userProfile?.customRewardMessage && (
                <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border border-green-500">
                    <p className="text-lg font-semibold text-green-400">আপনার কাস্টম রিওয়ার্ড:</p>
                    <p className="mt-1 text-lg italic text-green-300">{userProfile.customRewardMessage}</p>
                </div>
            )}
          </div>

          {/* New Download Button for premium users */}
          {isPremiumActive(userProfile) && (
            <a
              href="uploaded:PC_Cleaner_Faisal.ps1"
              download="PC_Cleaner_Faisal.ps1"
              className="w-full mt-8 inline-flex items-center justify-center px-8 py-3 rounded-full text-white font-bold bg-blue-500 hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Download className="mr-2" /> PC Cleaner ডাউনলোড করুন
            </a>
          )}

          {/* Redeem Code Button */}
          <button
            onClick={() => setCurrentPage('redeem')}
            className="w-full mt-4 px-8 py-3 rounded-full text-white font-bold bg-purple-500 hover:bg-purple-600 transition-colors shadow-lg"
          >
            <CodeIcon className="inline-block h-4 w-4 mr-1" /> কোড রিডিম করুন
          </button>
          
          <button
            onClick={() => setCurrentPage('main')}
            className="w-full mt-4 px-8 py-3 rounded-full text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
          >
            হোম পেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  };
  
  const RedeemPage = ({ setCurrentPage, userId, setUserProfile }) => {
    const [redeemCode, setRedeemCode] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRedeem = async () => {
      setIsLoading(true);
      setMessage('');
      if (!redeemCode) {
        setMessage('অনুগ্রহ করে একটি রিডিম কোড দিন।');
        setIsLoading(false);
        return;
      }
    
      try {
        const redeemCodesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'redeemCodes');
        const q = query(redeemCodesCollection, where('code', '==', redeemCode));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.empty) {
          setMessage('কোডটি inválido অথবা খুঁজে পাওয়া যায়নি।');
          setIsLoading(false);
          return;
        }
    
        const codeDoc = querySnapshot.docs[0];
        const codeData = codeDoc.data();
    
        // Check if the code has reached its usage limit
        if (codeData.usedBy.length >= codeData.limit) {
          setMessage('এই কোডটির ব্যবহারের সীমা অতিক্রম করেছে।');
          setIsLoading(false);
          return;
        }
    
        // Check if the user has already used this code
        if (codeData.usedBy.includes(userId)) {
          setMessage('আপনি ইতিমধ্যে এই কোডটি ব্যবহার করেছেন।');
          setIsLoading(false);
          return;
        }
    
        // Update user profile
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : { isPremium: false, premiumExpires: null, customRewardMessage: null };
        
        let updateData = {};
    
        if (codeData.rewardType === 'plan') {
            let premiumExpires = null;
            if (codeData.rewardValue === 'lifetime') {
                premiumExpires = null; // Lifetime plan
            } else {
                const now = new Date();
                now.setMonth(now.getMonth() + parseInt(codeData.rewardValue));
                premiumExpires = now;
            }
            updateData = {
                isPremium: true,
                premiumExpires: premiumExpires,
                customRewardMessage: null, // Clear any existing custom message
            };
        } else if (codeData.rewardType === 'custom') {
            updateData = {
                customRewardMessage: codeData.rewardValue,
                isPremium: userData.isPremium, // Keep existing premium status
                premiumExpires: userData.premiumExpires, // Keep existing premium expiration
            };
        }
    
        await updateDoc(userDocRef, updateData);
    
        // Update the redeem code document to mark it as used by the current user
        await updateDoc(codeDoc.ref, {
          usedBy: [...codeData.usedBy, userId],
        });
    
        // Update local state with the new user profile
        setUserProfile({
          ...userData,
          ...updateData,
          premiumExpires: updateData.premiumExpires ? { toDate: () => updateData.premiumExpires } : userData.premiumExpires,
        });
    
        setMessage('কোডটি সফলভাবে রিডিম করা হয়েছে! আপনার রিওয়ার্ড প্রোফাইলে দেখুন।');
      } catch (error) {
        console.error('Error redeeming code:', error);
        setMessage('একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।');
      } finally {
        setIsLoading(false);
      }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen text-white p-4" style={{ backgroundColor: colors.bg }}>
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md w-full text-center">
                <CodeIcon className="h-20 w-20 text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">কোড রিডিম করুন</h2>
                <p className="text-gray-400 mb-6">এখানে আপনার প্রিমিয়াম কোডটি ইনপুট করুন।</p>
                <div className="mb-4">
                    <input
                        type="text"
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value)}
                        placeholder="রিডিম কোড দিন"
                        className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    onClick={handleRedeem}
                    disabled={isLoading}
                    className="w-full mt-4 px-8 py-3 rounded-full text-white font-bold bg-purple-500 hover:bg-purple-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'প্রক্রিয়াকরণ...' : 'রিডিম করুন'}
                </button>
                {message && (
                    <div className="mt-4 text-center p-4 bg-gray-700 rounded-lg">
                        <p className="text-sm text-green-300">{message}</p>
                    </div>
                )}
                <button
                    onClick={() => setCurrentPage('profile')}
                    className="w-full mt-4 px-8 py-3 rounded-full text-white font-bold bg-gray-700 hover:bg-gray-600 transition-colors shadow-lg"
                >
                    প্রোফাইলে ফিরে যান
                </button>
            </div>
        </div>
    );
  };
  

  return (
    <div className="min-h-screen text-white font-sans antialiased" style={{ backgroundColor: colors.bg }}>
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-gray-900 bg-opacity-70 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Sparkles className="text-white h-8 w-8" />
              <span className="ml-2 text-2xl font-bold font-mono" style={{ color: colors.nameGreen }}>
                FAISAL'S
              </span>
            </div>
            {isMobile ? (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => setCurrentPage('main') || scrollToSection(link.id)}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {link.name}
                    </button>
                  ))}
                  {userProfile?.isAdmin && (
                    <button
                      onClick={() => setCurrentPage('admin')}
                      className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <Settings className="inline-block h-4 w-4 mr-1" /> অ্যাডমিন প্যানেল
                    </button>
                  )}
                  {userId ? (
                    <button
                      onClick={() => setCurrentPage('profile')}
                      className="text-white bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <UserIcon className="inline-block h-4 w-4 mr-1" /> প্রোফাইল
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentPage('login')}
                      className="text-white bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <Lock className="inline-block h-4 w-4 mr-1" /> লগ ইন
                    </button>
                  )}
                  <a
                    href="https://t.me/MrFaisalAhmed"
                    className="ml-4 px-4 py-2 rounded-full text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
                  >
                    কিনুন
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => setCurrentPage('main') || scrollToSection(link.id)}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                {link.name}
              </button>
            ))}
            {userProfile?.isAdmin && (
              <button
                onClick={() => setCurrentPage('admin')}
                className="text-white bg-blue-500 hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors"
              >
                <Settings className="inline-block h-4 w-4 mr-1" /> অ্যাডমিন প্যানেল
              </button>
            )}
            {userId ? (
              <button
                onClick={() => setCurrentPage('profile')}
                className="text-white bg-gray-700 hover:bg-gray-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors"
              >
                <UserIcon className="inline-block h-4 w-4 mr-1" /> প্রোফাইল
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('login')}
                className="text-white bg-gray-700 hover:bg-gray-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors"
              >
                <Lock className="inline-block h-4 w-4 mr-1" /> লগ ইন
              </button>
            )}
            <a
              href="https://t.me/MrFaisalAhmed"
              className="text-white bg-green-500 hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors"
            >
              কিনুন
            </a>
          </div>
        </div>
      </nav>

      {renderContent()}

      {/* Footer */}
      <footer id="contact" className="py-12 text-center" style={{ backgroundColor: colors.panel }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-lg font-bold">PC Cleaner - Developed by <span style={{ color: colors.nameGreen }}>Faisal Ahmed</span> for the Bongo Network Team</p>
          <p className="mt-4 text-gray-400">© 2025 All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            {/* The links below are placeholders, please add your own links if needed */}
            <a href="#" className="text-gray-400 hover:text-green-500 transition-colors"><span>Telegram</span></a>
            <a href="#" className="text-gray-400 hover:text-green-500 transition-colors"><span>Facebook</span></a>
            <a href="#" className="text-gray-400 hover:text-green-500 transition-colors"><span>Website</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple ChevronDown component since it's not in lucide-react by default
const ChevronDown = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default App;

