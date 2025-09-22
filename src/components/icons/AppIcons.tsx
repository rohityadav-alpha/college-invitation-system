// React Icons imports
import { 
  FaUsers, FaUserTie, FaGraduationCap, FaUserFriends,
  FaEnvelope, FaWhatsapp, FaSms, FaMobile,
  FaRobot, FaPaperPlane, FaRocket,
  FaEdit, FaTrash, FaEye, FaDownload, FaUpload,
  FaCalendar, FaClock, FaMapMarkerAlt, FaPhone,
  FaCog, FaHome, FaChartBar, FaSignOutAlt,
  FaLock, FaUser, FaBuilding, FaIndustry,
  FaSync, FaSearch, FaFilter, FaCopy,
  FaCheck, FaTimes, FaPlus, FaMinus,
  FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown,
  FaSave, FaUndo, FaRedo, FaPrint
} from 'react-icons/fa'

import { 
  HiAcademicCap, HiUsers, HiUserGroup, HiMail,
  HiChatAlt2, HiDeviceMobile, HiSparkles,
  HiPencilAlt, HiTrash, HiEye, HiDownload,
  HiUpload, HiCalendar, HiClock, HiLocationMarker,
  HiRefresh, HiSearch, HiFilter, HiDuplicate
} from 'react-icons/hi'

// Lucide React imports - Modern & Clean
import { 
  Users, GraduationCap, UserCheck, Building2,
  Mail, MessageCircle, Smartphone, Bot,
  Sparkles, Send, Rocket, Edit3, Trash2,
  Eye, Download, Upload, Calendar, Clock,
  MapPin, Phone, Settings, Home, BarChart3,
  LogOut, Lock, User, Shield, RefreshCw,
  Search, Filter, Copy, Check, X,
  Plus, Minus, ArrowLeft, ArrowRight,
  ArrowUp, ArrowDown, Save, RotateCcw,
  RotateCw, Printer, FileText, Folder,
  FolderOpen, Star, Heart, ThumbsUp,
  AlertCircle, CheckCircle, XCircle,
  Info, ExternalLink, Link, Unlink,
  Volume2, VolumeX, Play, Pause, Square,
  Forward, Rewind, SkipForward, SkipBack,
  Maximize, Minimize, Move, MoreHorizontal,
  MoreVertical, Grid, List, Layout,
  Image, Video, Music, FileImage,
  FileVideo, FileAudio, FileType,
  Archive, Briefcase, Award, Target,
  Zap, Coffee, Wifi, WifiOff, Battery,
  BatteryLow, Bluetooth, Camera, Mic,
  MicOff, Monitor, Smartphone as SmartphoneIcon,
  Tablet, Laptop, Server, Database,
  Cloud, CloudOff, Globe, Navigation,
  Compass, Flag, Bookmark, Tag,
  Hash, AtSign, Percent, DollarSign,
  Radio, 
} from 'lucide-react'

// Icon Props Interface
interface IconProps {
  size?: number
  className?: string
  color?: string
}

// Complete Action Icons Library
export const AppIcons = {
  // ========== USERS & PEOPLE ==========
  Students: ({ size = 20, className = "", color }: IconProps) => (
    <GraduationCap size={size} className={className} color={color} />
  ),
  
  Guests: ({ size = 20, className = "", color }: IconProps) => (
    <UserCheck size={size} className={className} color={color} />
  ),
  
  Professors: ({ size = 20, className = "", color }: IconProps) => (
    <Users size={size} className={className} color={color} />
  ),

  User: ({ size = 20, className = "", color }: IconProps) => (
    <User size={size} className={className} color={color} />
  ),

  UserGroup: ({ size = 20, className = "", color }: IconProps) => (
    <Users size={size} className={className} color={color} />
  ),

  // ========== COMMUNICATION ==========
  Email: ({ size = 20, className = "", color }: IconProps) => (
    <Mail size={size} className={className} color={color} />
  ),
  
  WhatsApp: ({ size = 20, className = "", color }: IconProps) => (
    <MessageCircle size={size} className={className} color={color} />
  ),
  
  SMS: ({ size = 20, className = "", color }: IconProps) => (
    <Smartphone size={size} className={className} color={color} />
  ),

  Phone: ({ size = 20, className = "", color }: IconProps) => (
    <Phone size={size} className={className} color={color} />
  ),

  Send: ({ size = 20, className = "", color }: IconProps) => (
    <Send size={size} className={className} color={color} />
  ),

  // ========== ACTION ICONS - MAIN REQUEST ==========
  Edit: ({ size = 20, className = "", color }: IconProps) => (
    <Edit3 size={size} className={className} color={color} />
  ),
  
  Delete: ({ size = 20, className = "", color }: IconProps) => (
    <Trash2 size={size} className={className} color={color} />
  ),

  Preview: ({ size = 20, className = "", color }: IconProps) => (
    <Eye size={size} className={className} color={color} />
  ),

  Refresh: ({ size = 20, className = "", color }: IconProps) => (
    <RefreshCw size={size} className={className} color={color} />
  ),

  // Alternative Action Icons
  View: ({ size = 20, className = "", color }: IconProps) => (
    <Eye size={size} className={className} color={color} />
  ),

  Update: ({ size = 20, className = "", color }: IconProps) => (
    <RotateCw size={size} className={className} color={color} />
  ),

  Reload: ({ size = 20, className = "", color }: IconProps) => (
    <RotateCcw size={size} className={className} color={color} />
  ),

  // ========== FILE OPERATIONS ==========
  Download: ({ size = 20, className = "", color }: IconProps) => (
    <Download size={size} className={className} color={color} />
  ),
  
  Upload: ({ size = 20, className = "", color }: IconProps) => (
    <Upload size={size} className={className} color={color} />
  ),

  Save: ({ size = 20, className = "", color }: IconProps) => (
    <Save size={size} className={className} color={color} />
  ),

  Copy: ({ size = 20, className = "", color }: IconProps) => (
    <Copy size={size} className={className} color={color} />
  ),

  Print: ({ size = 20, className = "", color }: IconProps) => (
    <Printer size={size} className={className} color={color} />
  ),

  // ========== SEARCH & FILTER ==========
  Search: ({ size = 20, className = "", color }: IconProps) => (
    <Search size={size} className={className} color={color} />
  ),

  Filter: ({ size = 20, className = "", color }: IconProps) => (
    <Filter size={size} className={className} color={color} />
  ),

  // ========== STATUS & FEEDBACK ==========
  Check: ({ size = 20, className = "", color }: IconProps) => (
    <Check size={size} className={className} color={color} />
  ),

  Close: ({ size = 20, className = "", color }: IconProps) => (
    <X size={size} className={className} color={color} />
  ),

  Success: ({ size = 20, className = "", color }: IconProps) => (
    <CheckCircle size={size} className={className} color={color} />
  ),

  Error: ({ size = 20, className = "", color }: IconProps) => (
    <XCircle size={size} className={className} color={color} />
  ),

  Warning: ({ size = 20, className = "", color }: IconProps) => (
    <AlertCircle size={size} className={className} color={color} />
  ),

  Info: ({ size = 20, className = "", color }: IconProps) => (
    <Info size={size} className={className} color={color} />
  ),

  // ========== ADD/REMOVE ==========
  Add: ({ size = 20, className = "", color }: IconProps) => (
    <Plus size={size} className={className} color={color} />
  ),

  Remove: ({ size = 20, className = "", color }: IconProps) => (
    <Minus size={size} className={className} color={color} />
  ),

  // ========== NAVIGATION ==========
  ArrowLeft: ({ size = 20, className = "", color }: IconProps) => (
    <ArrowLeft size={size} className={className} color={color} />
  ),

  ArrowRight: ({ size = 20, className = "", color }: IconProps) => (
    <ArrowRight size={size} className={className} color={color} />
  ),

  ArrowUp: ({ size = 20, className = "", color }: IconProps) => (
    <ArrowUp size={size} className={className} color={color} />
  ),

  ArrowDown: ({ size = 20, className = "", color }: IconProps) => (
    <ArrowDown size={size} className={className} color={color} />
  ),

  // ========== AI & TECHNOLOGY ==========
  AI: ({ size = 20, className = "", color }: IconProps) => (
    <Bot size={size} className={className} color={color} />
  ),
  
  Sparkles: ({ size = 20, className = "", color }: IconProps) => (
    <Sparkles size={size} className={className} color={color} />
  ),

  Robot: ({ size = 20, className = "", color }: IconProps) => (
    <Bot size={size} className={className} color={color} />
  ),

  Rocket: ({ size = 20, className = "", color }: IconProps) => (
    <Rocket size={size} className={className} color={color} />
  ),

  // ========== DATE & TIME ==========
  Calendar: ({ size = 20, className = "", color }: IconProps) => (
    <Calendar size={size} className={className} color={color} />
  ),
  
  Clock: ({ size = 20, className = "", color }: IconProps) => (
    <Clock size={size} className={className} color={color} />
  ),

  // ========== LOCATION & PLACES ==========
  Location: ({ size = 20, className = "", color }: IconProps) => (
    <MapPin size={size} className={className} color={color} />
  ),

  Building: ({ size = 20, className = "", color }: IconProps) => (
    <Building2 size={size} className={className} color={color} />
  ),

  // ========== NAVIGATION & MENU ==========
  Home: ({ size = 20, className = "", color }: IconProps) => (
    <Home size={size} className={className} color={color} />
  ),
  
  Dashboard: ({ size = 20, className = "", color }: IconProps) => (
    <BarChart3 size={size} className={className} color={color} />
  ),
  
  Settings: ({ size = 20, className = "", color }: IconProps) => (
    <Settings size={size} className={className} color={color} />
  ),

  Menu: ({ size = 20, className = "", color }: IconProps) => (
    <MoreHorizontal size={size} className={className} color={color} />
  ),

  MenuVertical: ({ size = 20, className = "", color }: IconProps) => (
    <MoreVertical size={size} className={className} color={color} />
  ),

  // ========== AUTHENTICATION ==========
  Lock: ({ size = 20, className = "", color }: IconProps) => (
    <Lock size={size} className={className} color={color} />
  ),
  
  Logout: ({ size = 20, className = "", color }: IconProps) => (
    <LogOut size={size} className={className} color={color} />
  ),

  Shield: ({ size = 20, className = "", color }: IconProps) => (
    <Shield size={size} className={className} color={color} />
  ),

  // ========== LAYOUT & VIEW ==========
  Grid: ({ size = 20, className = "", color }: IconProps) => (
    <Grid size={size} className={className} color={color} />
  ),

  List: ({ size = 20, className = "", color }: IconProps) => (
    <List size={size} className={className} color={color} />
  ),

  Layout: ({ size = 20, className = "", color }: IconProps) => (
    <Layout size={size} className={className} color={color} />
  ),

  // ========== EXTERNAL LINKS ==========
  ExternalLink: ({ size = 20, className = "", color }: IconProps) => (
    <ExternalLink size={size} className={className} color={color} />
  ),

  Link: ({ size = 20, className = "", color }: IconProps) => (
    <Link size={size} className={className} color={color} />
  ),

  // ========== SPECIAL ACTIONS ==========
  Star: ({ size = 20, className = "", color }: IconProps) => (
    <Star size={size} className={className} color={color} />
  ),

  Heart: ({ size = 20, className = "", color }: IconProps) => (
    <Heart size={size} className={className} color={color} />
  ),

  ThumbsUp: ({ size = 20, className = "", color }: IconProps) => (
    <ThumbsUp size={size} className={className} color={color} />
  ),

  Target: ({ size = 20, className = "", color }: IconProps) => (
    <Target size={size} className={className} color={color} />
  ),

  Award: ({ size = 20, className = "", color }: IconProps) => (
    <Award size={size} className={className} color={color} />
  ),

  Zap: ({ size = 20, className = "", color }: IconProps) => (
    <Zap size={size} className={className} color={color} />
  )
}

// Alternative Icon Styles (FontAwesome Based)
export const AltIcons = {
  Edit: ({ size = 20, className = "", color }: IconProps) => (
    <FaEdit size={size} className={className} color={color} />
  ),
  
  Delete: ({ size = 20, className = "", color }: IconProps) => (
    <FaTrash size={size} className={className} color={color} />
  ),

  Preview: ({ size = 20, className = "", color }: IconProps) => (
    <FaEye size={size} className={className} color={color} />
  ),

  Refresh: ({ size = 20, className = "", color }: IconProps) => (
    <FaSync size={size} className={className} color={color} />
  ),

  Search: ({ size = 20, className = "", color }: IconProps) => (
    <FaSearch size={size} className={className} color={color} />
  ),

  Filter: ({ size = 20, className = "", color }: IconProps) => (
    <FaFilter size={size} className={className} color={color} />
  ),

  Radio: ({ size = 20, className = "", color }: IconProps) => (
    <Radio size={size} className={className} color={color} />
  ),
  Eye: ({ size = 20, className = "", color }: IconProps) => (
    <FaEye size={size} className={className} color={color} />
  ),
}
