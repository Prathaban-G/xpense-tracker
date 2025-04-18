// components/Dashboard.js
import React, { useState, useContext, useEffect } from 'react';
import { getDocs, query,addDoc, collection, where , doc, getDoc,setDoc,serverTimestamp,updateDoc, deleteDoc} from "firebase/firestore";
import { auth, db } from "./firebase"; // adjust path
import { signOut } from 'firebase/auth';
import { UserContext } from '../App';
import LoadingAnimation from './LoadingAnimation';
import html2canvas from "html2canvas";

import {
  PiggyBank,
  User,
  LogOut,
  ArrowUp,
  ArrowDown,
  Plus,
  Download,
  Filter,Pencil,
  ChevronDown,Trash2,
  Calendar,MoreVertical,
  DollarSign,
  FileText, TrendingUp, ShoppingBag, Coffee, Home, Car, Briefcase, Film
} from 'lucide-react';
import ReactApexChart from 'react-apexcharts';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';

// Move chart configuration and utility functions outside component
const getIcon = (category) => {
  const iconMap = {
    Housing: <Home className="text-blue-500" size={20} />,
    Food: <Coffee className="text-purple-500" size={20} />,
    Transportation: <Car className="text-green-500" size={20} />,
    Entertainment: <Film className="text-yellow-500" size={20} />,
    Utilities: <DollarSign className="text-red-500" size={20} />,
    Shopping: <ShoppingBag className="text-pink-500" size={20} />,
    Healthcare: <Briefcase className="text-indigo-500" size={20} />,
    Other: <TrendingUp className="text-orange-500" size={20} />
  };

  return iconMap[category] || <DollarSign className="text-gray-500" size={20} />;
};

// Helper function to format date to readable format
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
function Dashboard({ initialLoading }) {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(initialLoading ?? true);

 
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeTimeFrame, setActiveTimeFrame] = useState('week');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [error, setError] = useState('');
 
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [transactionCategory, setTransactionCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [tooltipData, setTooltipData] = useState({ show: false, x: 0, y: 0, value: 0 });
const [editMode, setEditMode] = useState(false);
const [currentTransaction, setCurrentTransaction] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [reportFormat, setReportFormat] = useState('pdf');
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    incomeByCategory: {},
    expensesByCategory: {},
    recentTransactions: [],
    monthlyData: [],
    incomeHistory: [],
    expenseHistory: [],
    profitHistory: []
  });

  const expenseCategories = ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transportation', 'Dining', 'Shopping', 'Healthcare', 'Education', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Other'];

const [userBudget, setUserBudget] = useState(50000);
const [newBudget, setNewBudget] = useState('');
const [openBudgetModal, setOpenBudgetModal] = useState(false);

useEffect(() => {
  const fetchBudget = async () => {

const user = auth.currentUser; // Or however you're getting the user
    const docRef = doc(db, "users", user.uid, "budget", "monthly");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserBudget(docSnap.data().amount);
    }
  };
  fetchBudget();
}, [user]);

const handleSaveBudget = async () => {
  if (!newBudget) return;
  await setDoc(doc(db, "users", user.uid, "budget", "monthly"), {
    amount: Number(newBudget),
    updatedAt: serverTimestamp(),
  });
  setUserBudget(Number(newBudget));
  setOpenBudgetModal(false);
  setNewBudget('');
};

  // Fetch transactions

const handleLogout = async () => {
  setLoading(true); // Show loading immediately when logout starts
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
    setError("Failed to sign out. Please try again.");
  } finally {
    setLoading(false); // Always turn off loading
  }
};     

   useEffect(() => {
    const fetchTransactions = async () => {
      if (!initialLoading) {
        setLoading(true);
      }
      
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

      

        const transactionsSnapshot = await getDocs(collection(db, "users", user.uid, "transactions"));
        const transactions = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate dashboard values
        let totalIncome = 0;
        let totalExpenses = 0;
        const incomeByCategory = {};
        const expensesByCategory = {};
        const monthlyDataMap = {};

        transactions.forEach(tx => {
          const amount = parseFloat(tx.amount);
          const month = new Date(tx.date).toLocaleString("default", { month: "short" });

          if (tx.type === "income") {
            totalIncome += amount;
            incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + amount;
          } else {
            totalExpenses += Math.abs(amount);
            expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + Math.abs(amount);
          }

          if (!monthlyDataMap[month]) {
            monthlyDataMap[month] = { income: 0, expenses: 0 };
          }
          if (tx.type === "income") {
            monthlyDataMap[month].income += amount;
          } else {
            monthlyDataMap[month].expenses += Math.abs(amount);
          }
        });

        const monthlyData = Object.entries(monthlyDataMap).map(([month, data]) => ({
          month,
          income: data.income,
          expenses: data.expenses
        }));
        
        // Sort months chronologically
        monthlyData.sort((a, b) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return months.indexOf(a.month) - months.indexOf(b.month);
        });
        
        const incomeHistory = monthlyData.map(data => data.income);
        const expenseHistory = monthlyData.map(data => data.expenses);
        const profitHistory = monthlyData.map(data => data.income - data.expenses);
let incomeGrowth = 0;
if (monthlyData.length >= 2) {
  const lastMonthIncome = monthlyData[monthlyData.length - 2].income;
  const thisMonthIncome = monthlyData[monthlyData.length - 1].income;
  if (lastMonthIncome > 0) {
    incomeGrowth = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
  }
}// Expense Growth
let expenseGrowth = 0;
if (monthlyData.length >= 2) {
  const lastMonthExpense = monthlyData[monthlyData.length - 2].expenses;
  const thisMonthExpense = monthlyData[monthlyData.length - 1].expenses;
  if (lastMonthExpense > 0) {
    expenseGrowth = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
  }
}


        // Sort transactions by date descending
        const recentTransactions = transactions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);

        // Update state
        setDashboardData({
          totalIncome,
          totalExpenses,
          profit: totalIncome - totalExpenses,
          incomeByCategory,
          expensesByCategory,
          recentTransactions,
          monthlyData,
          incomeHistory,
          expenseHistory,
          profitHistory,
 incomeGrowth: incomeGrowth.toFixed(1),
expenseGrowth :expenseGrowth.toFixed(1)
        });
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  },  [initialLoading, user]);

  // ✅ Handle Add or Edit Transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setError("User not logged in");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const newTransaction = {
      date: new Date().toISOString().split('T')[0],
      description,
      amount: transactionType === 'expense' ? -parsedAmount : parsedAmount,
      category: transactionCategory,
      type: transactionType,
      createdAt: new Date().toISOString(),
    };

    try {
      if (editMode && currentTransaction) {
        // 🔄 UPDATE EXISTING TRANSACTION
        const docRef = doc(db, "users", user.uid, "transactions", currentTransaction.id);
        await updateDoc(docRef, newTransaction);

        const updatedTransactions = dashboardData.recentTransactions.map(t =>
          t.id === currentTransaction.id ? { ...t, ...newTransaction } : t
        );

        // Recalculate totals
        let updatedIncome = 0;
        let updatedExpenses = 0;

        updatedTransactions.forEach(t => {
          const amt = Math.abs(t.amount);
          if (t.type === 'income') updatedIncome += amt;
          else updatedExpenses += amt;
        });

        setDashboardData({
          ...dashboardData,
          recentTransactions: updatedTransactions.slice(0, 10),
          totalIncome: updatedIncome,
          totalExpenses: updatedExpenses,
          profit: updatedIncome - updatedExpenses,
        });

        setEditMode(false);
        setCurrentTransaction(null);
      } else {
        // ➕ ADD NEW TRANSACTION
        const docRef = await addDoc(collection(db, "users", user.uid, "transactions"), newTransaction);
        newTransaction.id = docRef.id;

        const updatedTransactions = [newTransaction, ...dashboardData.recentTransactions];

        let updatedIncome = dashboardData.totalIncome;
        let updatedExpenses = dashboardData.totalExpenses;

        if (transactionType === 'income') {
          updatedIncome += parsedAmount;
        } else {
          updatedExpenses += parsedAmount;
        }

        setDashboardData({
          ...dashboardData,
          recentTransactions: updatedTransactions.slice(0, 10),
          totalIncome: updatedIncome,
          totalExpenses: updatedExpenses,
          profit: updatedIncome - updatedExpenses,
        });
      }

      // Reset form
      setShowAddTransactionModal(false);
      setAmount('');
      setDescription('');
      setTransactionCategory('');
      setError('');
    } catch (error) {
      console.error("Error adding/editing transaction:", error);
      setError("Failed to save transaction. Please try again.");
    }
  };

  // ✏️ Handle Edit Click
  const handleEditTransaction = (transaction) => {
    setEditMode(true);
    setCurrentTransaction(transaction);
    setTransactionType(transaction.type);
    setAmount(Math.abs(transaction.amount));
    setDescription(transaction.description);
    setTransactionCategory(transaction.category);
    setShowAddTransactionModal(true);
  };

  // 🗑️ Show Delete Confirmation
  const handleConfirmDelete = (transaction) => {
    setCurrentTransaction(transaction);
    setShowDeleteModal(true);
  };

  // ❌ Handle Delete Action
  const handleDeleteTransaction = async () => {
    const user = auth.currentUser;
    if (!user || !currentTransaction) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "transactions", currentTransaction.id));

      const updatedTransactions = dashboardData.recentTransactions.filter(
        t => t.id !== currentTransaction.id
      );

      const amount = Math.abs(currentTransaction.amount);
      let updatedIncome = dashboardData.totalIncome;
      let updatedExpenses = dashboardData.totalExpenses;

      if (currentTransaction.type === 'income') {
        updatedIncome -= amount;
      } else {
        updatedExpenses -= amount;
      }

      setDashboardData({
        ...dashboardData,
        recentTransactions: updatedTransactions,
        totalIncome: updatedIncome,
        totalExpenses: updatedExpenses,
        profit: updatedIncome - updatedExpenses,
      });

      setShowDeleteModal(false);
      setCurrentTransaction(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // Handle generate report
  const handleGenerateReport = async (e) => {
    e.preventDefault();
  
    try {
      if (new Date(startDate) > new Date(endDate)) {
        setError("Start date cannot be after end date");
        return;
      }
  
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated");
        return;
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include end day
  
      const transactionsRef = collection(db, "users", user.uid, "transactions");
      const q = query(transactionsRef, where("date", ">=", startDate), where("date", "<=", endDate));
      const snapshot = await getDocs(q);
  
      const transactions = snapshot.docs.map(doc => doc.data());
  
      if (reportFormat === "pdf") {
        const doc = new jsPDF();
        doc.text("Transaction Report", 14, 16);
        doc.setFontSize(10);
        doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 24);
  
        const tableData = transactions.map(tx => [
          tx.date,
          tx.description,
          tx.category,
          tx.type,
          `₹${tx.amount.toLocaleString()}`
        ]);
  
        doc.autoTable({
          head: [["Date", "Description", "Category", "Type", "Amount"]],
          body: tableData,
          startY: 30
        });
  
        doc.save(`Transaction_Report_${startDate}_to_${endDate}.pdf`);
      } else if (reportFormat === "csv") {
        const header = ["Date", "Description", "Category", "Type", "Amount"];
        const rows = transactions.map(tx =>
          [tx.date, tx.description, tx.category, tx.type, tx.amount]
        );
  
        let csvContent = "data:text/csv;charset=utf-8," +
          [header, ...rows].map(e => e.join(",")).join("\n");
  
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Transaction_Report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
      }
  
      // Reset form
      setShowReportModal(false);
      setStartDate('');
      setEndDate('');
      setError('');
  
      alert(`Your ${reportFormat.toUpperCase()} report is ready for download.`);
  
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report. Please try again.");
    }
  };

  // Prepare expense breakdown data
  const expenseData = dashboardData?.expensesByCategory || {};
  const totalExpenses = Object.values(expenseData).reduce((sum, amount) => sum + amount, 0) || 0;

  // Calculate percentages and prepare data
  const categories = Object.keys(expenseData).map(category => {
    const amount = expenseData[category];
    const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
    return { name: category, amount, percentage };
  }).sort((a, b) => b.amount - a.amount);

  // Color palette
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500',
    'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ];
// Filter transactions based on active time frame
const getFilteredTransactions = () => {
  const today = new Date();
  const transactions = dashboardData?.recentTransactions || [];
  if (activeTimeFrame === 'day') {
    return transactions.filter(tx =>
      tx.date && new Date(tx.date).toDateString() === today.toDateString()
    );
  }
  if (activeTimeFrame === 'week') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    return transactions.filter(tx =>
      tx.date && new Date(tx.date) >= oneWeekAgo
    );
  }
  if (activeTimeFrame === 'month') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return transactions.filter(tx =>
      tx.date && new Date(tx.date) >= oneMonthAgo
    );
  }
  return transactions;
};
const getChartData = () => {
  const allTransactions = dashboardData?.recentTransactions || [];
  //console.log('All Transactions:', allTransactions);

  const now = new Date();
  let categories = [];
  let incomeData = [];
  let expenseData = [];
  const groupedTransactions = {};

  allTransactions.forEach(tx => {
    const date = new Date(tx.date);
    let key;

    if (activeTimeFrame === 'day') {
      // Show data for last 7 days
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
      if (diffDays > 6) return;

      key = date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (activeTimeFrame === 'week') {
      const diffWeeks = (now - date) / (1000 * 60 * 60 * 24 * 7);
      if (diffWeeks > 3) return;

      const day = date.getDay();
      const diffToSunday = -day;
      const sunday = new Date(date);
      sunday.setDate(sunday.getDate() + diffToSunday);

      key = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (activeTimeFrame === 'month') {
      const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      if (monthDiff > 11) return;

      key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    }

    if (!groupedTransactions[key]) {
      groupedTransactions[key] = { income: 0, expense: 0 };
    }

    if (tx.type === 'income') {
      groupedTransactions[key].income += tx.amount;
    } else if (tx.type === 'expense') {
      groupedTransactions[key].expense += tx.amount;
    }
  });

  if (activeTimeFrame === 'day') {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    last7Days.forEach(day => {
      categories.push(day);
      incomeData.push(groupedTransactions[day]?.income || 0);
      expenseData.push(Math.abs(groupedTransactions[day]?.expense || 0));
    });
  } else if (activeTimeFrame === 'week') {
    const last4Weeks = [...Array(4)].map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (7 * (3 - i)));

      const day = d.getDay();
      const diffToSunday = -day;
      d.setDate(d.getDate() + diffToSunday);

      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    last4Weeks.forEach(label => {
      categories.push(label);
      incomeData.push(groupedTransactions[label]?.income || 0);
      expenseData.push(Math.abs(groupedTransactions[label]?.expense || 0));
    });
  } else if (activeTimeFrame === 'month') {
    const last12Months = [...Array(12)].map((_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      return d.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    last12Months.forEach(month => {
      categories.push(month);
      incomeData.push(groupedTransactions[month]?.income || 0);
      expenseData.push(Math.abs(groupedTransactions[month]?.expense || 0));
    });
  } else if (activeTimeFrame === 'all') {
    return {
      categories: (dashboardData.monthlyData || []).map(item => item.month),
      incomeData: dashboardData.incomeHistory || [],
      expenseData: (dashboardData.expenseHistory || []).map(val => Math.abs(val))
    };
  }

 // console.log('Chart Output:', { categories, incomeData, expenseData });
  return { categories, incomeData, expenseData };
};


// Utility to get ISO week number
const getWeekNumber = (date) => {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  return Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
};


// Update chart options and series when timeframe changes
const updateChartData = () => {
  const chartData = getChartData();
  
  // Update chart options with new categories
  barChartOptions.xaxis.categories = chartData.categories;
  
  // Update chart y-axis max value
  const maxValue = Math.max(
    Math.max(...chartData.incomeData, 0),
    Math.max(...chartData.expenseData, 0)
  ) * 1.2; // Add 20% padding at the top
  
  barChartOptions.yaxis.max = maxValue || 1000; // Default to 1000 if no data
  
  // Update chart series with new data
  barChartSeries[0].data = chartData.incomeData;
  barChartSeries[1].data = chartData.expenseData;
  

};

// Call updateChartData whenever activeTimeFrame changes
useEffect(() => {
  updateChartData();
}, [activeTimeFrame, dashboardData]);

// Define the chart options (with modifications to use filtered data)
const barChartOptions = {
  chart: {
    type: 'bar',
    stacked: false,
    toolbar: {
      show: false
    },
    foreColor: '#fff'
  },
  colors: ['#6366F1', '#F97316'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 5,
      distributed: false,
      dataLabels: {
        position: 'center',
      },
      startingShape: 'flat',
      endingShape: 'flat'
    },
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    // Categories will be updated by updateChartData
    categories: [],
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    labels: {
      style: {
        colors: '#fff'
      }
    }
  },
  yaxis: {
    title: {
      text: '',
    },
    labels: {
      formatter: function (value) {
        return '₹' + Math.abs(value);
      },
      style: {
        colors: '#fff'
      }
    },
    min: 0,
    max: 1000, // Default value, will be updated by updateChartData
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  grid: {
    show: false
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    labels: {
      colors: '#fff'
    }
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: function (value) {
        return `₹${Math.abs(value)}`;
      },
      title: {
        formatter: function (seriesName) {
          return seriesName;
        }
      }
    }
  }
};

// Initialize with empty data - will be updated by updateChartData
const barChartSeries = [
  {
    name: 'Income',
    data: []
  },
  {
    name: 'Expenses',
    data: []
  }
];

// Call updateChartData initially to populate the chart
updateChartData();
  const getStatusColor = (profit) => {
    return profit >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const filteredTransactions = getFilteredTransactions();
  const paginatedTransactions = filteredTransactions.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

 
  const spendingPercent = Math.min(
    Math.round((dashboardData.totalExpenses / userBudget) * 100),
    100
  );
  return (
   
    <div className="min-h-screen bg-gray-900 text-white">
     
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <h1 className="flex items-center space-x-2 font-extrabold pl-9">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-6xl drop-shadow-lg">
                X
              </span>
              <span className="text-white text-3xl tracking-wide">penseTracker</span>
              <PiggyBank className="w-10 h-10 text-rose-400 animate-bounce" />
            </h1>

            {/* User Profile */}
            <div className="relative" 
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)} 
            >
              <button
                className="flex items-center space-x-2 rounded-full px-1 py-2 transition-transform transform hover:scale-150"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg py-2 z-20"
                  >
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium">{user?.username || 'User'}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-full lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Income Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-300 text-sm">Total Income</p>
                  <h3 className="text-3xl font-bold mt-1">{formatCurrency(dashboardData.totalIncome)}</h3>
                </div>
                <div className="p-3 bg-blue-500/30 rounded-xl">
                  <ArrowUp className="w-6 h-6 text-blue-300" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-300">
                <ArrowUp className="w-4 h-4 mr-1" />
               <span>{dashboardData.incomeGrowth}% from last month</span>
              </div>
              {/* Small Line Chart */}
              <div className="mt-3 h-12" title="shows Month chart">
  <ReactApexChart
        options={{
          chart: {
            toolbar: { show: false },
            sparkline: { enabled: true },
            events: {
              mouseMove: (event, chartContext, config) => {
                // Only proceed if we have a valid dataPointIndex
                if (config.dataPointIndex !== undefined && config.dataPointIndex >= 0) {
                  const value = dashboardData.incomeHistory[config.dataPointIndex];
                  const seriesIndex = config.seriesIndex || 0;
                  
                  // Get coordinates from the points array
                  const x = config.clientX - chartContext.el.getBoundingClientRect().left;
                  const y = config.clientY - chartContext.el.getBoundingClientRect().top;
                  
                  setTooltipData({
                    show: true,
                    x: x,
                    y: y,
                    value: value
                  });
                }
              },
              mouseLeave: () => {
                setTooltipData({ show: false, x: 0, y: 0, value: 0 });
              }
            }
          },
          grid: { show: false },
          xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
          yaxis: { show: false },
          stroke: { curve: 'smooth', width: 2, colors: ['#93c5fd'] },
          tooltip: { 
            enabled: false,  // Disable the built-in tooltip since we're creating our own
          },
          markers: { size: 4, colors: ['#93c5fd'], hover: { size: 6 } },
        }}
        series={[{ data: dashboardData.incomeHistory || [0] }]}
        type="line"
        height={48}
      />
      
      {tooltipData.show && (
        <div 
          className="absolute px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-md transform -translate-x-1/2 -translate-y-8"
          style={{ 
            left: `${tooltipData.x}px`, 
            top: `${tooltipData.y}px`,
          }}
        >
          {formatCurrency(tooltipData.value)}
        </div>
      )}
              </div>
            </div>

            {/* Expenses Card */}
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-300 text-sm">Total Expenses</p>
                  <h3 className="text-3xl font-bold mt-1">{formatCurrency(dashboardData.totalExpenses)}</h3>
                </div>
                <div className="p-3 bg-red-500/30 rounded-xl">
                  <ArrowDown className="w-6 h-6 text-red-300" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-300">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>{dashboardData.expenseGrowth}% from last month</span>
              </div>
              {/* Small Line Chart */}
              <div className="mt-3 h-12">
                <ReactApexChart
                  options={{
                    chart: { toolbar: { show: false }, sparkline: { enabled: true } },
                    grid: { show: false },
                    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
                    yaxis: { show: false },
                    stroke: { curve: 'smooth', width: 2, colors: ['#fda4af'] },
                    tooltip: { enabled: false },
                    markers: { size: 3, colors: ['#fda4af'] },
                  }}
                  series={[{ data: dashboardData.expenseHistory || [0] }]}
                  type="line"
                  height={48}
                />
              </div>
            </div>

            {/* Profit/Loss Card */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-300 text-sm">{dashboardData.profit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                  <h3 className={`text-3xl font-bold mt-1 ${getStatusColor(dashboardData.profit)}`}>
                    {formatCurrency(Math.abs(dashboardData.profit))}
                  </h3>
                </div>
                <div className={`p-3 ${dashboardData.profit >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'} rounded-xl`}>
                  {dashboardData.profit >= 0 ? (
                    <ArrowUp className="w-6 h-6 text-emerald-300" />
                  ) : (
                    <ArrowDown className="w-6 h-6 text-red-300" />
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-300">
                <span>{dashboardData.profit >= 0 ? 'You are in a good financial state!' : 'You are spending more than you earn'}</span>
              </div>
              {/* Small Line Chart */}
              <div className="mt-3 h-12">
                <ReactApexChart
                  options={{
                    chart: { toolbar: { show: false }, sparkline: { enabled: true } },
                    grid: { show: false },
                    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
                    yaxis: { show: false },
                    stroke: { curve: 'smooth', width: 2, colors: [dashboardData.profit >= 0 ? '#6ee7b7' : '#fda4af'] },
                    tooltip: { enabled: false },
                    markers: { size: 3, colors: [dashboardData.profit >= 0 ? '#6ee7b7' : '#fda4af'] },
                  }}
                  series={[{ data: dashboardData.profitHistory || [0] }]}
                  type="line"
                  height={48}
                />
              </div>
            </div>
          </motion.div>

          {/* Budget Goal Progress */}
         <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="col-span-full lg:col-span-1 shadow-lg"
      >
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-purple-300 text-sm">Monthly Budget</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(userBudget)}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-purple-500/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-300" />
              </div>
              <button onClick={() => setOpenBudgetModal(true)} className="text-purple-300 hover:text-white">
                <Pencil className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-purple-300">Current spending</span>
              <span className="text-white font-medium">{spendingPercent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  dashboardData.totalExpenses > userBudget
                    ? "bg-red-500"
                    : "bg-purple-500"
                } rounded-full`}
                style={{ width: `${spendingPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {dashboardData.totalExpenses > userBudget
                ? `You've exceeded your budget by ${formatCurrency(
                    dashboardData.totalExpenses - userBudget
                  )}`
                : `${formatCurrency(
                    userBudget - dashboardData.totalExpenses
                  )} remaining`}
            </p>
          </div>

          {/* Days left in month */}
          <div className="mt-6 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-300">Days left in month</span>
              <span className="text-lg font-bold text-white">
                {new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  0
                ).getDate() - new Date().getDate()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
          {/* Income vs Expense (Bar Chart) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-full lg:col-span-2 bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Income vs Expenses</h3>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeTimeFrame === 'day' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setActiveTimeFrame('day')}
                >
                  Day
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeTimeFrame === 'week' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setActiveTimeFrame('week')}
                >
                  Week
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeTimeFrame === 'month' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setActiveTimeFrame('month')}
                >
                  Month
                </button>
              </div>
            </div>
           
          <div id="income-expense-chart">
            <ReactApexChart
              options={barChartOptions}
              series={barChartSeries}
              type="bar"
              height={300}
            />
          </div>
        </motion.div>

        {/* Recent Transactions */}
{/* Recent Transactions */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
  className="col-span-full lg:col-span-2 bg-gray-800 rounded-2xl p-6 shadow-lg"
>
  {/* Desktop Header */}
  <div className="hidden sm:flex justify-between items-center mb-6">
    <h3 className="text-xl font-semibold">Recent Transactions</h3>
    <div className="flex space-x-3">
      <button
        onClick={() => setShowReportModal(true)}
        className="flex items-center px-3 py-2 text-sm bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
      >
        <FileText className="w-4 h-4 mr-2" />
        Report
      </button>
      <button
        onClick={() => setShowAddTransactionModal(true)}
        className="flex items-center px-3 py-2 text-sm bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Transaction
      </button>
    </div>
  </div>

  {/* Mobile Header */}
  <div className="sm:hidden mb-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Recent Transactions</h3>
      <button
        onClick={() => setShowAddTransactionModal(true)}
        className="fixed bottom-4 right-4 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex md:hidden items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>
      <div className="relative">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {showMobileMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  setShowReportModal(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Report
              </button>
              <button
                onClick={() => {
                  setShowAddTransactionModal(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Table - Fully Responsive */}
  <div className="w-full overflow-x-hidden">
    <table className="table-fixed w-full text-sm sm:text-base">
  <thead>
  <tr className="text-left text-gray-400 text-xs sm:text-sm">
    <th className="pb-3 pr-2 w-[20%] truncate whitespace-nowrap">Date</th>
    <th className="pb-3 pr-2 w-[20%] truncate whitespace-nowrap">Description</th>
    <th className="pb-3 pr-2 w-[20%] truncate whitespace-nowrap">Category</th>
    <th className="pb-3 pr-2 text-right w-[25%] truncate whitespace-nowrap">Amount</th>
    <th className="pb-3 text-right w-[15%] truncate whitespace-nowrap">Actions</th>
  </tr>
</thead>

  <tbody className="divide-y divide-gray-700">
    {getFilteredTransactions()
      .slice(currentPage * itemsPerPage, (currentPage * itemsPerPage) + itemsPerPage)
      .map(transaction => (
        <tr key={transaction.id} className="text-gray-300 text-xs sm:text-sm">
          <td className="py-3 truncate whitespace-nowrap overflow-hidden">{transaction.date}</td>
          <td className="py-3 truncate whitespace-nowrap overflow-hidden">{transaction.description}</td>
          <td className="py-3 truncate whitespace-nowrap overflow-hidden">
            <span className={`px-2 py-1 rounded-full text-xs ${transaction.type === 'income' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {transaction.category}
            </span>
          </td>
          <td className={`py-3 text-right font-medium truncate whitespace-nowrap overflow-hidden ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR'
            })}
          </td>
          <td className="py-3 text-right space-x-2 truncate whitespace-nowrap overflow-hidden">
            <button
              onClick={() => handleEditTransaction(transaction)}
              className="text-blue-400 hover:text-blue-600"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleConfirmDelete(transaction)}
              className="text-red-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </td>
        </tr>
      ))}
  </tbody>
</table>
  </div>

  {/* No Transactions */}
  {getFilteredTransactions().length === 0 && (
    <div className="text-center py-8 text-gray-400">
      <p>No transactions found for this time period</p>
    </div>
  )}

  {/* Pagination */}
  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm">
    <div className="flex items-center mb-4 sm:mb-0">
      <span className="text-gray-400 mr-2">Show:</span>
      <div className="flex bg-gray-700 rounded-lg">
        {[5, 10, 20].map(size => (
          <button
            key={size}
            onClick={() => {
              setItemsPerPage(size);
              setCurrentPage(0);
            }}
            className={`px-3 py-1 ${itemsPerPage === size ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'} transition-colors rounded-lg`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <span className="text-gray-400">
        Showing {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, getFilteredTransactions().length)} of {getFilteredTransactions().length}
      </span>
      <div className="flex bg-gray-700 rounded-lg">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className={`px-3 py-1 ${currentPage === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-600'} transition-colors rounded-l-lg`}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(Math.ceil(getFilteredTransactions().length / itemsPerPage) - 1, currentPage + 1))}
          disabled={currentPage >= Math.ceil(getFilteredTransactions().length / itemsPerPage) - 1}
          className={`px-3 py-1 ${currentPage >= Math.ceil(getFilteredTransactions().length / itemsPerPage) - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-600'} transition-colors rounded-r-lg`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
</motion.div>
      </div>
      <div className="bg-gray-800 mt-4 rounded-2xl p-6 shadow-xl flex flex-col h-full transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
        {/* Header with shimmer effect */}
        <div className="relative mb-4 pb-2 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Expense Breakdown</h3>
          <div className="absolute bottom-0 left-0 h-0.5 w-24 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        </div>

        {/* Horizontal bars with percentages */}
        <div className="flex-grow">
          {categories.map((category, index) => (
            <div key={category.name} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getIcon(category.name)}
                  <span className="text-sm font-medium text-gray-300">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">₹{category.amount.toLocaleString()}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                    {category.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>

            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
          <span className="text-sm text-gray-400">Total Expenses</span>
          <span className="text-lg font-bold text-white">₹{totalExpenses.toLocaleString()}</span>
        </div>
      </div>
    </main>

    {/* Footer */}

    <Footer />
{/* Budget Modal */}
<AnimatePresence>
  {openBudgetModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-800 rounded-2xl p-8 shadow-xl max-w-sm w-full"
      >
        <h2 className="text-lg font-semibold text-purple-400 mb-4">Set Monthly Budget</h2>
        <input
          type="number"
          className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter budget amount"
          value={newBudget}
          onChange={(e) => setNewBudget(e.target.value)}
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setOpenBudgetModal(false)}
            className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBudget}
            className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    {/* Add Transaction Modal */}
    <AnimatePresence>
      {showAddTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full"
          >
            <h3 className="text-2xl font-semibold mb-6">Add Transaction</h3>

            <form onSubmit={handleAddTransaction}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`py-3 rounded-lg flex items-center justify-center ${transactionType === 'expense'
                      ? 'bg-red-500/30 border-2 border-red-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    onClick={() => setTransactionType('expense')}
                  >
                    <ArrowDown className={`w-4 h-4 mr-2 ${transactionType === 'expense' ? 'text-red-300' : 'text-gray-300'}`} />
                    <span>Expense</span>
                  </button>

                  <button
                    type="button"
                    className={`py-3 rounded-lg flex items-center justify-center ${transactionType === 'income'
                      ? 'bg-green-500/30 border-2 border-green-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    onClick={() => setTransactionType('income')}
                  >
                    <ArrowUp className={`w-4 h-4 mr-2 ${transactionType === 'income' ? 'text-green-300' : 'text-gray-300'}`} />
                    <span>Income</span>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3"
                  placeholder="Transaction description"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  id="category"
                  value={transactionCategory}
                  onChange={(e) => setTransactionCategory(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3"
                  required
                >
                  <option value="">Select a category</option>
                  {transactionType === 'expense' ? (
                    expenseCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  ) : (
                    incomeCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTransactionModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Delete Modal */}
{showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-800 rounded-2xl p-8 shadow-xl max-w-sm w-full"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Are you sure you want to delete this transaction?
      </h3>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteTransaction}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </div>
)}


    {/* Generate Report Modal */}
    <AnimatePresence>
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full"
          >
            <h3 className="text-2xl font-semibold mb-6">Generate Report</h3>

            <form onSubmit={handleGenerateReport}>
              <div className="mb-4">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="reportFormat" className="block text-sm font-medium text-gray-300 mb-2">Report Format</label>
                <select
                  id="reportFormat"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3"
                >
                  <option value="pdf">PDF</option>
              
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    

  </div>

);
}

export default Dashboard;