import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, User, FileText, Printer, LogOut, Menu, 
  ChevronRight, Lock, BookOpen, Save, CheckCircle,
  UserPlus, Database, PlusCircle, LayoutDashboard, 
  Building, BookPlus, FileSpreadsheet, Edit, Trash2, KeyRound, UserCheck, CheckSquare, Settings, Eye, PenTool, Download, CalendarDays, ListChecks, Settings2, FileUp, Loader2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const fallbackConfig = {
  apiKey: "AIzaSyDjmmR1MNrV-QKeOnI-6qQUGBDWzI4fZQ8",
  authDomain: "e-rapor-sekolah.firebaseapp.com",
  projectId: "e-rapor-sekolah",
  storageBucket: "e-rapor-sekolah.firebasestorage.app",
  messagingSenderId: "157497221130",
  appId: "1:157497221130:web:64e380ea6a91b593297ff3"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : fallbackConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Helper untuk aturan Paths (Path Wajib dari Platform)
const publicDbPath = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);
const docPath = (colName, docId) => doc(db, 'artifacts', appId, 'public', 'data', colName, docId);

// --- KOMPONEN EDITOR TEMPLATE ---
const RichTextEditor = ({ initialValue, onBlur }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imgWidth, setImgWidth] = useState(0);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  const execCmd = (cmd, val = null) => {
    document.execCommand('styleWithCSS', false, true); 
    document.execCommand(cmd, false, val);
    if (editorRef.current) editorRef.current.focus();
    if (editorRef.current) onBlur(editorRef.current.innerHTML); 
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
         execCmd('insertImage', event.target.result);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target);
      setImgWidth(e.target.clientWidth);
      
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNode(e.target);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      setSelectedImage(null);
    }
  };

  const handleWidthChange = (e) => {
    const val = e.target.value;
    setImgWidth(val);
    if (selectedImage) {
      selectedImage.style.width = val + 'px';
      selectedImage.style.height = 'auto';
      if(editorRef.current) onBlur(editorRef.current.innerHTML); 
    }
  };

  return (
    <div className="flex-1 flex flex-col relative border border-gray-300 rounded-xl shadow-sm bg-white overflow-hidden">
      <div className="bg-gray-100 p-2 flex items-center space-x-2 border-b border-gray-300 flex-wrap gap-y-2">
        <select onChange={(e) => execCmd('fontName', e.target.value)} className="p-1.5 bg-white rounded hover:bg-gray-50 border border-gray-300 text-xs shadow-sm font-medium outline-none">
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="'Arial Narrow', sans-serif">Arial Narrow / PT Sans</option>
          <option value="Calibri">Calibri</option>
          <option value="Courier New">Courier New</option>
        </select>
        
        <select onChange={(e) => execCmd('fontSize', e.target.value)} className="p-1.5 bg-white rounded hover:bg-gray-50 border border-gray-300 text-xs shadow-sm font-medium outline-none">
          <option value="3">Ukuran (Normal)</option>
          <option value="1">Sangat Kecil (8pt)</option>
          <option value="2">Kecil (10pt)</option>
          <option value="4">Sedang (14pt)</option>
          <option value="5">Besar (18pt)</option>
        </select>
        
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('bold')} className="p-1.5 bg-white rounded hover:bg-gray-200 font-bold px-3 shadow-sm border text-sm">B</button>
        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('italic')} className="p-1.5 bg-white rounded hover:bg-gray-200 italic px-3 shadow-sm border text-sm">I</button>
        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('underline')} className="p-1.5 bg-white rounded hover:bg-gray-200 underline px-3 shadow-sm border text-sm">U</button>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('justifyLeft')} className="p-1.5 bg-white rounded hover:bg-gray-200 text-xs shadow-sm border">Kiri</button>
        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('justifyCenter')} className="p-1.5 bg-white rounded hover:bg-gray-200 text-xs shadow-sm border">Tengah</button>
        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('justifyRight')} className="p-1.5 bg-white rounded hover:bg-gray-200 text-xs shadow-sm border">Kanan</button>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        <button onMouseDown={e => e.preventDefault()} onClick={() => fileInputRef.current.click()} className="p-1.5 bg-white rounded hover:bg-gray-200 text-xs shadow-sm border font-bold text-blue-700 flex items-center"><FileUp size={12} className="mr-1"/> Gambar</button>
      </div>

      {selectedImage && (
         <div className="bg-yellow-50 p-2.5 flex flex-wrap items-center gap-3 border-b border-yellow-200 animate-in slide-in-from-top-2">
           <span className="text-xs font-bold text-yellow-800 flex items-center"><Settings size={14} className="mr-1"/> Atur Ukuran Gambar:</span>
           <input type="range" min="20" max="1000" value={imgWidth} onChange={handleWidthChange} className="w-32 md:w-64 accent-yellow-600" />
           <div className="flex items-center space-x-1">
             <input type="number" value={imgWidth} onChange={handleWidthChange} className="w-16 p-1 text-xs border border-yellow-300 rounded outline-none text-center bg-white" />
             <span className="text-xs font-semibold text-yellow-700">px</span>
           </div>
           <button onMouseDown={e => e.preventDefault()} onClick={() => setSelectedImage(null)} className="text-xs px-3 py-1.5 bg-white text-red-600 border border-red-200 shadow-sm rounded-lg hover:bg-red-50 font-bold ml-auto transition-colors">Tutup Menu</button>
         </div>
      )}

      <div 
        id="rapor-editor-div" 
        ref={editorRef} 
        onClick={handleClick}
        onKeyUp={() => { if(selectedImage && !document.body.contains(selectedImage)) setSelectedImage(null); }}
        className="rapor-document flex-1 bg-white p-8 min-h-[500px] max-h-[600px] overflow-y-auto outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500 [&_img]:inline-block" 
        contentEditable={true} 
        suppressContentEditableWarning={true} 
        onBlur={(e) => onBlur(e.currentTarget.innerHTML)}
      ></div>
    </div>
  );
};

// --- DATA INITIAL SEEDER (JIKA DATABASE KOSONG) ---
const INITIAL_TEACHERS = [ { id: 't1', name: 'Ahmad Budi Santoso, S.Pd', jk: 'L', nip: '198001012005011001', level: 'SD' }, { id: 't2', name: 'Siti Aminah, S.Pd', jk: 'P', nip: '198502022010012002', level: 'SMP' } ];
const INITIAL_USERS = [ { id: 'u1', username: 'admin', password: '123', role: 'admin' }, { id: 'u2', username: 'guru1', password: '123', role: 'wali kelas', teacherId: 't1' }, { id: 'u3', username: 'guru2', password: '123', role: 'guru', teacherId: 't2' } ];
const INITIAL_SCHOOLS = [ { id: 'sch-1', name: 'SDIT Al Hikmah Pangkep', npsn: '10101234', address: 'Jl. Andi Mauraga', level: 'SD' } ];
const INITIAL_CLASSES = [ { id: 'cls-1', name: 'VI Ar Rauf', level: 'SD', tingkat: '6', teacherId: 't1' } ];
const INITIAL_SUBJECTS = [ { id: 'sub-1', name: 'Pendidikan Agama Islam', level: 'SD', teacherId: 't1', isLokal: false, urutan: 1 }, { id: 'sub-lokal-1', name: 'Bahasa Inggris', level: 'SD', teacherId: 't1', isLokal: true, urutan: 2 } ];
const INITIAL_STUDENTS = [ { id: 'std-1', name: 'ANDI NARAYA', jk: 'L', nisn: '0145017511', nis: '2005029', level: 'SD' } ];
const INITIAL_CPS = [ { id: 'cp-1', subjectId: 'sub-1', classId: 'cls-1', tahunAjaran: '2025/2026', semester: 'Ganjil', fase: 'C', deskripsi: "menganalisis dan mengamalkan ayat Al-Qur'an tentang etos kerja." } ];

const defaultSpecialData = { surah: ['JUZ 30'], hadist: ['Hadits menjawab Adzan'], doa: ['Doa Selamat Dunia Akhirat'], tilawah: ['Wafa 5'] };

const INITIAL_ENROLLMENTS = [
  {
    id: 'enr-1', studentId: 'std-1', classId: 'cls-1', tahunAjaran: '2025/2026', semester: 'Ganjil',
    kehadiran: { sakit: 0, izin: 3, alpa: 0 },
    nilai: {
      'sub-1': { sumatif1: '83', sumatif2: '85', tercapai: "Mencapai Kompetensi dengan Baik dalam hal menunjukkan penguasaan yg baik dalam membaca surah ad-duha yang umumnya berkaitan dengan jaminan Allah SWT.", belumTercapai: "Perlu Peningkatan dalam hal meneladani Asmaulhusna menumbuhkan sikap dan karakter terpuji dalam kehidupan sehari hari.", selectedCps: {} },
    },
    specialData: defaultSpecialData,
    karakter: 'Ananda menunjukkan rasa cinta kepada Tuhan, menyayangi sesama manusia, hewan, dan lingkungan sebagai ciptaan-Nya. Ia selalu bersyukur, dan berupaya berkata jujur, serta dapat dipercaya ketika diberi tugas.',
    catatanWalas: 'Ananda mulai memahami bagaimana cara pikir dan perasaannya bekerja, serta berusaha mengendalikannya dengan baik (neurosains).'
  }
];

const DEFAULT_HTML_TEMPLATE = `
<div style="text-align: center; margin-bottom: 15px; border-bottom: 3px double black; padding-bottom: 10px;">
  <h2 style="margin:0; font-size: 18px; color: #166534;">YAYASAN SITTI ZAENAB EMSIL</h2>
  <h1 style="margin:0; font-size: 24px; color: #1e3a8a; text-transform: uppercase;">{{NAMA_SEKOLAH|U}}</h1>
  <p style="margin:0; font-style: italic; color: #dc2626; font-weight: bold; font-size: 12px;">berkarakter dan berprestasi</p>
  <p style="margin:0; font-size: 11pt;">{{ALAMAT_SEKOLAH|P}}</p>
</div>
<h3 style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 20px; letter-spacing: 2px;">RAPOR SISIPAN</h3>
<table style="width: 100%; margin-bottom: 15px; font-size: 11pt; font-weight: bold; text-align: left;">
  <tr><td style="width: 80px;">Nama</td><td style="width: 10px;">:</td><td>{{NAMA_SISWA|U}}</td><td style="width: 80px;">Kelas</td><td style="width: 10px;">:</td><td>{{KELAS}}</td></tr>
  <tr><td>NISN / NIS</td><td>:</td><td>{{NISN}} / {{NIS}}</td><td>Fase / Tingkat</td><td>:</td><td>{{FASE}} / {{TINGKAT}}</td></tr>
  <tr><td>Tahun Ajaran</td><td>:</td><td>{{TAHUN_AJARAN}}</td><td>Semester</td><td>:</td><td>{{SEMESTER|P}}</td></tr>
</table>
{{TABEL_NILAI}}
<br/>
<div style="border: 1px solid black; margin-bottom: 15px; page-break-inside: avoid;">
  <div style="background-color: #f3f4f6; font-weight: bold; padding: 4px; border-bottom: 1px solid black;">DESKRIPSI KARAKTER & CATATAN</div>
  <div style="padding: 8px; min-height: 50px;"><b>Karakter:</b><br/>{{KARAKTER}}<br/><br/><b>Catatan Wali Kelas:</b><br/>{{CATATAN_WALAS}}</div>
</div>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; page-break-inside: avoid;">
  <tr><td style="width: 50%; vertical-align: top; padding-right: 10px;">{{TABEL_HAFALAN}}</td><td style="width: 50%; vertical-align: top; padding-left: 10px;">{{TABEL_ABSENSI}}</td></tr>
</table>
<table style="width: 100%; margin-top: 30px; page-break-inside: avoid;">
  <tr><td style="text-align: center; width: 50%;">Mengetahui,<br/>Kepala {{NAMA_SEKOLAH|P}}<br/><br/><br/><br/><b><u>{{NAMA_KEPSEK|P}}</u></b><br/>NIY. {{NIP_KEPSEK}}</td><td style="text-align: center; width: 50%;">{{TEMPAT_CETAK}}, {{TANGGAL_CETAK}}<br/>Wali Kelas<br/><br/><br/><br/><b><u>{{NAMA_WALAS|P}}</u></b><br/>NIY. {{NIP_WALAS}}</td></tr>
</table>
`;

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [dbUser, setDbUser] = useState(null);

  // --- STATES CLOUD (DI-SINKRONISASI DENGAN FIREBASE) ---
  const [academicYears, setAcademicYears] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [cps, setCps] = useState([]);
  const [enrollments, setEnrollments] = useState([]); 
  
  const defaultRaporSetting = { tempatCetak: 'Pangkep', tanggalCetak: '2025-10-01', kepalaSekolah: 'Asniati, S.Pd.,Gr.', nipKepalaSekolah: 'AW9687 07111991 02 14', fontFamily: 'Arial, sans-serif', templateHtml: DEFAULT_HTML_TEMPLATE };
  const [raporSettings, setRaporSettings] = useState({ SD: { ...defaultRaporSetting }, SMP: { ...defaultRaporSetting }, SMA: { ...defaultRaporSetting } });
  
  const [predikats, setPredikats] = useState([ { id: 'p1', min: 91, max: 100, label: 'Sangat Baik' }, { id: 'p2', min: 81, max: 90, label: 'Baik' }, { id: 'p3', min: 70, max: 80, label: 'Cukup' }, { id: 'p4', min: 0, max: 69, label: 'Kurang' } ]);

  // --- STATES LOKAL (UI & NAVIGASI) ---
  
  // FIX: Menggunakan localStorage agar pilihan Tahun Ajaran & Semester tidak hilang saat di-refresh
  const [activeTA, setActiveTA] = useState(() => localStorage.getItem('eRapor_activeTA') || '2025/2026');
  const [activeSemester, setActiveSemester] = useState(() => localStorage.getItem('eRapor_activeSemester') || 'Ganjil');

  // Menyimpan perubahan ke memori browser setiap kali user mengganti pilihan
  useEffect(() => { localStorage.setItem('eRapor_activeTA', activeTA); }, [activeTA]);
  useEffect(() => { localStorage.setItem('eRapor_activeSemester', activeSemester); }, [activeSemester]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [activeMenu, setActiveMenu] = useState(''); 
  const [activeClass, setActiveClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(''); 
  const [activeSubjectId, setActiveSubjectId] = useState(null); 
  const [isNilaiExpanded, setIsNilaiExpanded] = useState(false); 
  const [isWaliExpanded, setIsWaliExpanded] = useState(false); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loginError, setLoginError] = useState('');
  const [systemWarning, setSystemWarning] = useState('');

  const [cpInputMode, setCpInputMode] = useState('otomatis'); 
  const [isFinalViewMode, setIsFinalViewMode] = useState(false);
  const [showPredikatModal, setShowPredikatModal] = useState(false);
  
  // State Import Nilai
  const [showImportNilaiModal, setShowImportNilaiModal] = useState(false);
  const [importNilaiText, setImportNilaiText] = useState('');

  // CRUD States Local
  const [newTAForm, setNewTAForm] = useState(''); 
  const [schoolView, setSchoolView] = useState('table'); 
  const [schoolForm, setSchoolForm] = useState({ id: '', name: '', npsn: '', address: '', level: 'SD' });
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [classView, setClassView] = useState('table'); 
  const [classTab, setClassTab] = useState('SD');
  const [classFormState, setClassFormState] = useState({ id: '', name: '', level: 'SD', tingkat: '', teacherId: '' });
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [activeRombelClass, setActiveRombelClass] = useState(null);
  const [teacherView, setTeacherView] = useState('table'); 
  const [teacherTab, setTeacherTab] = useState('SD');
  const [teacherFormState, setTeacherFormState] = useState({ id: '', name: '', jk: 'L', nip: '', level: 'SD' });
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [studentView, setStudentView] = useState('table'); 
  const [studentTab, setStudentTab] = useState('SD');
  const [studentFormState, setStudentFormState] = useState({ id: '', name: '', jk: 'L', nisn: '', nis: '', level: 'SD' });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [subjectView, setSubjectView] = useState('table'); 
  const [subjectTab, setSubjectTab] = useState('SD');
  const [subjectFormState, setSubjectFormState] = useState({ id: '', name: '', level: 'SD', teacherId: '', isLokal: false, urutan: '' });
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [loginView, setLoginView] = useState('table'); 
  const [loginFormState, setLoginFormState] = useState({ id: '', username: '', password: '', role: 'guru', teacherId: '' });
  const [isEditingLogin, setIsEditingLogin] = useState(false);
  const [cpView, setCpView] = useState('table');
  const [cpTab, setCpTab] = useState('SD');
  const [selectedCpSubject, setSelectedCpSubject] = useState('');
  const [cpFormState, setCpFormState] = useState({ id: '', subjectId: '', classId: '', tahunAjaran: '2025/2026', semester: 'Ganjil', fase: '', deskripsi: '' });
  const [isEditingCp, setIsEditingCp] = useState(false);

  const [printConfig, setPrintConfig] = useState({ paperSize: 'A4', marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10 });
  const [printDataQueue, setPrintDataQueue] = useState(null); 
  const [raporTab, setRaporTab] = useState('SD');
  const [raporViewMode, setRaporViewMode] = useState('settings'); 
  const [rekapTab, setRekapTab] = useState('SD'); 

  // Definisi activeEnrollments (DIPERBARUI: Hanya hitung jika data induk siswa masih ada)
  const activeEnrollments = enrollments.filter(e => 
    e.tahunAjaran === activeTA && 
    e.semester === activeSemester && 
    students.some(s => s.id === e.studentId)
  );

  // --- SETUP FIREBASE & AUTHENTICATION ---
  useEffect(() => {
    let isMounted = true; 
    // Mengubah judul tab browser secara otomatis
    document.title = "e-Rapor | Sistem Manajemen Akademik";

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { 
        console.error("Auth error:", error); 
        if (isMounted) setSystemWarning("Gagal terhubung ke Firebase. Pratinjau mungkin berjalan dengan mode terbatas.");
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
       if (isMounted) {
         setDbUser(u); 
         setIsReady(true);
       }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // --- SINKRONISASI DATA DARI CLOUD (SNAPSHOTS) ---
  useEffect(() => {
    if (!isReady || !dbUser) return;

    const checkAndSeed = async () => {
       try {
         const uSnap = await getDocs(publicDbPath('users'));
         if (uSnap.empty) {
            INITIAL_USERS.forEach(u => setDoc(docPath('users', u.id), u));
            INITIAL_TEACHERS.forEach(t => setDoc(docPath('teachers', t.id), t));
            INITIAL_SCHOOLS.forEach(s => setDoc(docPath('schools', s.id), s));
            INITIAL_CLASSES.forEach(c => setDoc(docPath('classes', c.id), c));
            INITIAL_STUDENTS.forEach(s => setDoc(docPath('students', s.id), s));
            INITIAL_SUBJECTS.forEach(s => setDoc(docPath('subjects', s.id), s));
            INITIAL_CPS.forEach(c => setDoc(docPath('cps', c.id), c));
            INITIAL_ENROLLMENTS.forEach(e => setDoc(docPath('enrollments', e.id), e));
            ['2023/2024', '2024/2025', '2025/2026', '2026/2027'].forEach(y => setDoc(docPath('academicYears', y.replace('/','-')), {value: y}));
            ['SD', 'SMP', 'SMA'].forEach(lvl => setDoc(docPath('raporSettings', lvl), defaultRaporSetting));
         }
       } catch (err) { 
           console.error("Error Seeding Database:", err); 
           if (err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions')) {
               setSystemWarning("Akses Firestore ditolak! Pastikan tab 'Rules' di Firestore Anda diatur menjadi 'allow read, write: if true;'");
           }
       }
    };
    checkAndSeed();

    const handleDbError = (err) => {
      console.error(err);
      if (err.code === 'permission-denied') {
         setSystemWarning("Akses Firestore ditolak! Pastikan tab 'Rules' di Firestore Anda diatur menjadi 'allow read, write: if true;'");
      }
    };

    const uTA = onSnapshot(publicDbPath('academicYears'), snap => { if(!snap.empty) setAcademicYears(snap.docs.map(d => d.data().value).sort().reverse()); }, handleDbError);
    const uTeach = onSnapshot(publicDbPath('teachers'), snap => setTeachers(snap.docs.map(d => d.data())), handleDbError);
    const uUsers = onSnapshot(publicDbPath('users'), snap => setUsers(snap.docs.map(d => d.data())), handleDbError);
    const uSchools = onSnapshot(publicDbPath('schools'), snap => setSchools(snap.docs.map(d => d.data())), handleDbError);
    const uClasses = onSnapshot(publicDbPath('classes'), snap => setClasses(snap.docs.map(d => d.data())), handleDbError);
    const uStudents = onSnapshot(publicDbPath('students'), snap => setStudents(snap.docs.map(d => d.data())), handleDbError);
    const uSubjects = onSnapshot(publicDbPath('subjects'), snap => setSubjects(snap.docs.map(d => d.data())), handleDbError);
    const uCps = onSnapshot(publicDbPath('cps'), snap => setCps(snap.docs.map(d => d.data())), handleDbError);
    const uEnrollments = onSnapshot(publicDbPath('enrollments'), snap => setEnrollments(snap.docs.map(d => d.data())), handleDbError);
    
    const uSettings = onSnapshot(publicDbPath('raporSettings'), snap => {
       if (!snap.empty) {
         let newSet = { SD: { ...defaultRaporSetting }, SMP: { ...defaultRaporSetting }, SMA: { ...defaultRaporSetting } };
         snap.docs.forEach(d => { newSet[d.id] = { ...defaultRaporSetting, ...d.data() }; });
         setRaporSettings(newSet);
       }
    }, handleDbError);

    return () => { uTA(); uTeach(); uUsers(); uSchools(); uClasses(); uStudents(); uSubjects(); uCps(); uEnrollments(); uSettings(); };
  }, [isReady, dbUser]);

  useEffect(() => { if (isLoggedIn && (!currentUser || !currentUser.role)) handleLogout(); }, [isLoggedIn, currentUser]);
  useEffect(() => { if (printDataQueue && printDataQueue.length > 0) setTimeout(() => window.print(), 500); }, [printDataQueue]);

  const showNotification = (msg) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };
  
  const handleCopyVariable = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text; textArea.style.position = "fixed"; 
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); showNotification(`Variabel ${text} berhasil disalin!`); } catch (err) {}
    document.body.removeChild(textArea);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value; const password = e.target.password.value;
    const user = users.find(u => u.username === username);
    if (!user) return setLoginError("Akun belum terdaftar di dalam sistem!");
    if (user.password !== password) return setLoginError("Password yang Anda masukkan salah!");
    setLoginError(''); setIsLoggedIn(true);

    if (user.role === 'admin') {
      setCurrentUser({ ...user, name: 'Administrator System' }); setActiveMenu('admin-dashboard'); showNotification("Berhasil masuk sebagai Admin System");
    } else {
      const teacherInfo = teachers.find(t => t.id === user.teacherId);
      setCurrentUser({ ...user, name: teacherInfo?.name || 'Guru' });
      const assignedClass = classes.find(c => c.teacherId === teacherInfo?.id) || null;
      setActiveClass(assignedClass); setActiveMenu('guru-dashboard'); showNotification(`Berhasil masuk sebagai ${user.role}`);
    }
  };

  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(null); setActiveMenu(''); setActiveClass(null); setSelectedClassId(''); setActiveSubjectId(null); };

  const getFase = (tingkat) => {
    const t = parseInt(tingkat);
    if (t >= 1 && t <= 2) return 'A'; if (t >= 3 && t <= 4) return 'B'; if (t >= 5 && t <= 6) return 'C';
    if (t >= 7 && t <= 9) return 'D'; if (t === 10) return 'E'; if (t >= 11 && t <= 12) return 'F';
    return '-';
  };

  // --- HANDLERS CRUD ---
  const handleAddTA = async (e) => {
    e.preventDefault(); const ta = newTAForm.trim();
    if (!ta) return;
    if (academicYears.includes(ta)) return alert("Tahun Ajaran ini sudah ada di dalam daftar!");
    try { await setDoc(docPath('academicYears', ta.replace('/','-')), { value: ta }); setNewTAForm(''); showNotification(`Tahun Ajaran ${ta} berhasil ditambahkan!`); } catch(e) { console.error(e); }
  };
  const handleDeleteTA = async (ta) => {
    if (academicYears.length === 1) return alert("Gagal: Minimal harus tersisa 1 Tahun Ajaran!");
    if (ta === activeTA) return alert("Gagal: Tahun Ajaran ini sedang aktif digunakan!");
    if (enrollments.some(e => e.tahunAjaran === ta) && !window.confirm(`PERINGATAN! Ada data menggunakan Tahun Ajaran ${ta}. Anda yakin?`)) return;
    try { await deleteDoc(docPath('academicYears', ta.replace('/','-'))); showNotification(`Tahun Ajaran ${ta} berhasil dihapus!`); } catch(e) { console.error(e); }
  };

  const handleDeleteSchool = async (id) => { try { await deleteDoc(docPath('schools', id)); showNotification("Data dihapus!"); } catch(e) {} };
  const handleDeleteTeacher = async (id) => { try { await deleteDoc(docPath('teachers', id)); showNotification("Data dihapus!"); } catch(e) {} };
  
  // PERBAIKAN 1: Saat kelas dihapus, bersihkan juga semua status rombel siswa di dalamnya
  const handleDeleteClass = async (id) => { 
    try { 
      await deleteDoc(docPath('classes', id)); 
      const enrToDelete = enrollments.filter(e => e.classId === id);
      for(const enr of enrToDelete) {
         await deleteDoc(docPath('enrollments', enr.id));
      }
      showNotification("Data Kelas beserta Rombel terkait dihapus!"); 
    } catch(e) {} 
  };
  
  // DIPERBARUI: Saat siswa dihapus, hapus juga data rombel/nilainya agar tidak menjadi 'Ghost Data'
  const handleDeleteStudent = async (id) => { 
    try { 
      await deleteDoc(docPath('students', id)); 
      const enrToDelete = enrollments.filter(e => e.studentId === id);
      for(const enr of enrToDelete) {
         await deleteDoc(docPath('enrollments', enr.id));
      }
      showNotification("Data Siswa & Rombel berhasil dihapus!"); 
    } catch(e) {} 
  };
  
  const handleDeleteSubject = async (id) => { try { await deleteDoc(docPath('subjects', id)); showNotification("Data dihapus!"); } catch(e) {} };
  const handleDeleteLogin = async (id) => { try { await deleteDoc(docPath('users', id)); showNotification("Akun dihapus!"); } catch(e) {} };
  const handleDeleteCp = async (id) => { try { await deleteDoc(docPath('cps', id)); showNotification("CP dihapus!"); } catch(e) {} };

  // PERBAIKAN: Penyimpanan form langsung ke Database Cloud
  const handleSaveSchool = async (e) => { e.preventDefault(); const data = { ...schoolForm }; if (!data.id) data.id = 'sch-' + Date.now(); try { await setDoc(docPath('schools', data.id), data); showNotification("Data Sekolah tersimpan ke Cloud!"); setSchoolView('table'); } catch(e) { console.error(e); } };
  const handleSaveTeacher = async (e) => { e.preventDefault(); const data = { ...teacherFormState, level: teacherTab }; if (!data.id) data.id = 't' + Date.now(); try { await setDoc(docPath('teachers', data.id), data); showNotification("Data Guru tersimpan ke Cloud!"); setTeacherView('table'); } catch(e) { console.error(e); } };
  const handleSaveClass = async (e) => { e.preventDefault(); const data = { ...classFormState, level: classTab }; if (!data.id) data.id = 'cls-' + Date.now(); try { await setDoc(docPath('classes', data.id), data); showNotification("Data Kelas tersimpan ke Cloud!"); setClassView('table'); } catch(e) { console.error(e); } };
  
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const isDuplicate = students.some(s => s.nisn === studentFormState.nisn && s.id !== studentFormState.id);
    if (isDuplicate) return alert("Gagal: NISN ini sudah terdaftar!");
    const data = { ...studentFormState, level: studentTab }; if (!data.id) data.id = 'std-' + Date.now();
    try { await setDoc(docPath('students', data.id), data); showNotification("Siswa tersimpan!"); setStudentView('table'); } catch(e) {}
  };
  
  const handleImportSiswaSubmit = async () => {
    if(!importText.trim()) return alert("Tempelkan data excel terlebih dahulu!");
    const rows = importText.trim().split('\n');
    let successCount = 0;
    try {
      for (const row of rows) {
        const cols = row.split(/\t/);
        if (cols.length >= 4) {
          const id = 'std-' + Date.now() + Math.random().toString().substr(2,5);
          await setDoc(docPath('students', id), { id: id, name: cols[0].trim(), jk: cols[1].trim().toUpperCase() === 'P' ? 'P' : 'L', nisn: cols[2].trim().replace(/\D/g, ''), nis: cols[3].trim(), level: studentTab });
          successCount++;
        }
      }
      if (successCount > 0) { showNotification(`${successCount} Siswa berhasil di-import ke jenjang ${studentTab}!`); setShowImportModal(false); setImportText(''); } 
      else { alert("Format tidak dikenali. Pastikan menyalin 4 kolom dari Excel (Nama, JK, NISN, NIS)."); }
    } catch(e) { console.error(e); }
  };

  // --- HANDLER IMPORT NILAI & CP ---
  const handleImportNilaiSubmit = (classId, subjectId) => {
    if(!importNilaiText.trim()) return alert("Tempelkan data excel terlebih dahulu!");
    const rows = importNilaiText.trim().split('\n');
    let successCount = 0;

    setEnrollments(prevEnrs => {
      let nextEnrs = [...prevEnrs];
      for (const row of rows) {
        const cols = row.split(/\t/);
        if (cols.length >= 5) {
          const nisn = cols[0].trim().replace(/\D/g, '');
          const sumatif1 = cols[1].trim();
          const sumatif2 = cols[2].trim();
          const tercapai = cols[3].trim();
          const belumTercapai = cols[4].trim();

          const student = students.find(s => s.nisn === nisn);
          if (student) {
            const enrIndex = nextEnrs.findIndex(e => e.studentId === student.id && e.classId === classId && e.tahunAjaran === activeTA && e.semester === activeSemester);
            if (enrIndex > -1) {
              const e = nextEnrs[enrIndex];
              const currentNilai = e.nilai || {};
              const currentSubjectNilai = currentNilai[subjectId] || { sumatif1: '', sumatif2: '', tercapai: '', belumTercapai: '', selectedCps: {} };
              
              nextEnrs[enrIndex] = {
                ...e,
                nilai: {
                  ...currentNilai,
                  [subjectId]: {
                    ...currentSubjectNilai,
                    sumatif1: sumatif1,
                    sumatif2: sumatif2,
                    tercapai: tercapai,
                    belumTercapai: belumTercapai
                  }
                }
              };
              successCount++;
            }
          }
        }
      }
      return nextEnrs;
    });

    if (successCount > 0) {
      showNotification(`${successCount} data nilai & CP berhasil di-import! Silakan klik Simpan untuk menyimpan ke Database Cloud.`);
      setCpInputMode('manual'); 
      setShowImportNilaiModal(false);
      setImportNilaiText('');
    } else {
      alert("Gagal mengimpor. Pastikan format kolom benar (NISN | Sumatif 1 | Sumatif 2 | Capaian Tercapai | Capaian Perlu Bimbingan) dan pastikan NISN cocok dengan siswa di kelas yang sedang aktif.");
    }
  };

  const handleSaveSubject = async (e) => { e.preventDefault(); const data = { ...subjectFormState, level: subjectTab }; if (!data.id) data.id = 'sub-' + Date.now(); try { await setDoc(docPath('subjects', data.id), data); showNotification("Tersimpan!"); setSubjectView('table'); } catch(e){} };
  const handleSaveLogin = async (e) => { e.preventDefault(); const data = { ...loginFormState }; if (!data.id) data.id = 'u' + Date.now(); try { await setDoc(docPath('users', data.id), data); showNotification("Tersimpan!"); setLoginView('table'); } catch(e){} };
  const handleSaveCp = async (e) => { e.preventDefault(); if (!cpFormState.classId) return alert("Silakan pilih Kelas!"); const data = { ...cpFormState }; if (!data.id) data.id = 'cp-' + Date.now(); try { await setDoc(docPath('cps', data.id), data); showNotification("Tersimpan!"); setCpView('table'); } catch(e){} };

  // --- TRANSAKSI ENROLLMENT LOKAL (SEBELUM DISIMPAN KE CLOUD) ---
  const handleAttendanceChange = (enrId, field, value) => { setEnrollments(enrollments.map(e => e.id === enrId ? { ...e, kehadiran: { ...(e.kehadiran || { sakit: 0, izin: 0, alpa: 0 }), [field]: value } } : e)); };
  const handleGradeChange = (enrId, subjectId, field, value) => {
    setEnrollments(enrollments.map(e => {
      if (e.id === enrId) {
        const currentNilai = e.nilai || {};
        const currentSubjectNilai = currentNilai[subjectId] || { sumatif1: '', sumatif2: '', tercapai: '', belumTercapai: '', selectedCps: {} };
        return { ...e, nilai: { ...currentNilai, [subjectId]: { ...currentSubjectNilai, [field]: value } } };
      }
      return e;
    }));
  };
  const handleSelectCpCheckbox = (enrId, subjectId, cpId, status) => {
    setEnrollments(enrollments.map(e => {
      if (e.id === enrId) {
        const currentNilai = e.nilai || {};
        const currentSubjectNilai = currentNilai[subjectId] || { sumatif1: '', sumatif2: '', tercapai: '', belumTercapai: '', selectedCps: {} };
        const newSelectedCps = { ...(currentSubjectNilai.selectedCps || {}) };
        if (newSelectedCps[cpId] === status) delete newSelectedCps[cpId]; else newSelectedCps[cpId] = status;
        return { ...e, nilai: { ...currentNilai, [subjectId]: { ...currentSubjectNilai, selectedCps: newSelectedCps } } };
      }
      return e;
    }));
  };
  const handleSpecialDataChange = (enrId, category, index, value) => { setEnrollments(enrollments.map(e => { if (e.id === enrId) { const currentData = e.specialData || { surah: [''], hadist: [''], doa: [''], tilawah: [''] }; const updatedCategory = [...currentData[category]]; updatedCategory[index] = value; return { ...e, specialData: { ...currentData, [category]: updatedCategory } }; } return e; })); };
  const handleAddSpecialData = (enrId, category) => { setEnrollments(enrollments.map(e => e.id === enrId ? { ...e, specialData: { ...(e.specialData || { surah: [''], hadist: [''], doa: [''], tilawah: [''] }), [category]: [...(e.specialData?.[category] || []), ''] } } : e)); };
  const handleRemoveSpecialData = (enrId, category, index) => { setEnrollments(enrollments.map(e => { if (e.id === enrId) { const currentData = e.specialData || { surah: [''], hadist: [''], doa: [''], tilawah: [''] }; const updatedCategory = currentData[category].filter((_, i) => i !== index); if (updatedCategory.length === 0) updatedCategory.push(''); return { ...e, specialData: { ...currentData, [category]: updatedCategory } }; } return e; })); };
  const handleCatatanChange = (enrId, field, value) => { setEnrollments(enrollments.map(e => e.id === enrId ? { ...e, [field]: value } : e)); };

  const handleCekNilaiAkhir = (classObj, subjectId) => {
    if (cpInputMode === 'otomatis') {
      const availableCps = cps.filter(c => c.subjectId === subjectId && c.classId === classObj.id && c.tahunAjaran === activeTA && c.semester === activeSemester);
      setEnrollments(prevEnrs => prevEnrs.map(e => {
        if (e.classId !== classObj.id) return e;
        const n = e.nilai[subjectId] || {};
        const s1 = parseFloat(n.sumatif1) || 0; const s2 = parseFloat(n.sumatif2) || 0;
        let avg = 0; if (n.sumatif1 !== '' || n.sumatif2 !== '') avg = Math.round((s1+s2)/(n.sumatif1 !== '' && n.sumatif2 !== '' ? 2 : 1));
        const pred = predikats.find(p => avg >= p.min && avg <= p.max)?.label || 'Baik';
        const sel = n.selectedCps || {};
        const cpTercapai = availableCps.filter(c => sel[c.id] === 'tercapai').map(c => c.deskripsi).join(', ');
        const cpBelum = availableCps.filter(c => sel[c.id] === 'belumTercapai').map(c => c.deskripsi).join(', ');

        let textTercapai = cpTercapai ? `Mencapai Kompetensi dengan ${pred} dalam hal ${cpTercapai}.` : '';
        let textBelum = cpBelum ? `Perlu Peningkatan dalam hal ${cpBelum}.` : '';

        return { ...e, nilai: { ...e.nilai, [subjectId]: { ...n, tercapai: textTercapai, belumTercapai: textBelum } } };
      }));
    }
    setIsFinalViewMode(true); showNotification("Menampilkan Mode Cek Nilai Akhir (Read-Only).");
  };

  // PUSH MASSAL KE CLOUD FIREBASE
  const handleSaveBulkEnrollments = async (classId) => {
    try {
      const classEnrs = enrollments.filter(e => e.classId === classId);
      for (const enr of classEnrs) {
         await updateDoc(docPath('enrollments', enr.id), {
            nilai: enr.nilai || {}, kehadiran: enr.kehadiran || {},
            specialData: enr.specialData || {}, karakter: enr.karakter || '', catatanWalas: enr.catatanWalas || ''
         });
      }
      showNotification("Berhasil menyimpan data ke Cloud Database!");
    } catch (e) { console.error(e); alert("Gagal menyimpan ke Database!"); }
  };

  const handleSaveRaporSettings = async (e) => {
    e.preventDefault();
    try { await setDoc(docPath('raporSettings', raporTab), raporSettings[raporTab]); showNotification(`Pengaturan Rapor Jenjang ${raporTab} tersimpan di Cloud!`); } catch(e){}
  };

  // Handle Rombel Siswa: Tambah ke Kelas / Hapus dari Kelas di Cloud
  const handleToggleRombel = async (stdId, targetClassId, currentEnrollment) => {
    try {
      if (currentEnrollment) {
        await deleteDoc(docPath('enrollments', currentEnrollment.id));
      } else {
        const newEnr = { id: 'enr-' + Date.now(), studentId: stdId, classId: targetClassId, tahunAjaran: activeTA, semester: activeSemester, kehadiran: { sakit: 0, izin: 0, alpa: 0 }, nilai: {}, specialData: { surah: [''], hadist: [''], doa: [''], tilawah: [''] }, karakter: '', catatanWalas: '' };
        await setDoc(docPath('enrollments', newEnr.id), newEnr);
      }
    } catch(e) { console.error(e); }
  };

  const handleTextareaResize = (e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; };
  const autoResizeRef = (el) => { if (el) setTimeout(() => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }, 0); };

  const renderTabs = (currentTab, setTab) => (
    <div className="flex space-x-2 border-b border-gray-200 mb-4 pb-2">
      {['SD', 'SMP', 'SMA'].map(lvl => (
        <button key={lvl} onClick={() => setTab(lvl)} className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${currentTab === lvl ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Jenjang {lvl}</button>
      ))}
    </div>
  );

  const getTingkatFormat = (tingkat) => {
    const map = { '1': 'I (Satu)', '2': 'II (Dua)', '3': 'III (Tiga)', '4': 'IV (Empat)', '5': 'V (Lima)', '6': 'VI (Enam)', '7': 'VII (Tujuh)', '8': 'VIII (Delapan)', '9': 'IX (Sembilan)', '10': 'X (Sepuluh)', '11': 'XI (Sebelas)', '12': 'XII (Dua Belas)' };
    return map[tingkat] || tingkat;
  };
  const formatTanggal = (dateStr) => { if(!dateStr) return ''; return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr)); };

  const compileHtmlRapor = (enrId) => {
    const enr = enrollments.find(e => e.id === enrId);
    if (!enr) return '';
    const student = students.find(s => s.id === enr.studentId) || { name: '-', nisn: '-', nis: '-' };
    const cls = classes.find(c => c.id === enr.classId) || { name: '[Kelas]', tingkat: '1', level: 'SD' };
    const level = cls.level || 'SD';
    const teacher = teachers.find(t => t.id === cls.teacherId) || { name: '[Wali Kelas]', nip: '' };
    const school = schools.find(s => s.level === level) || { name: '[Sekolah]', address: '' };
    const settings = raporSettings[level] || defaultRaporSetting;
    
    let html = settings.templateHtml || '';
    html = html.replace(/outline:\s*[^;]+;/gi, ''); 

    const subUmum = subjects.filter(s => s.level === level && !s.isLokal).sort((a,b) => (a.urutan || 0) - (b.urutan || 0));
    const subLokal = subjects.filter(s => s.level === level && s.isLokal).sort((a,b) => (a.urutan || 0) - (b.urutan || 0));
    
    // PEMBARUAN: Arial 10pt dan pengembalian fungsi white-space nowrap agar huruf di tabel tidak terpotong
    let tNilaiHtml = `<table style="font-family: Arial, sans-serif !important; font-size: 10pt !important; width: 100%; border-collapse: collapse; border: 1px solid black; margin-bottom: 15px; page-break-inside: auto;"><thead style="display: table-header-group;"><tr style="background-color: #f3f4f6; text-align: center; font-weight: bold; page-break-inside: avoid;"><th rowspan="2" style="border: 1px solid black; padding: 4px; width: 4%;">No</th><th rowspan="2" style="border: 1px solid black; padding: 4px; width: 18%;">Mata Pelajaran</th><th colspan="2" style="border: 1px solid black; padding: 4px; width: 12%; white-space: nowrap;">Sumatif Lingkup<br/>Materi</th><th rowspan="2" style="border: 1px solid black; padding: 4px; width: 8%; background-color: #fecaca; white-space: nowrap;">Nilai Akhir<br/>Sumatif</th><th rowspan="2" style="border: 1px solid black; padding: 4px; width: 58%;">Capaian Kompetensi</th></tr><tr style="background-color: #f3f4f6; text-align: center; font-weight: bold; page-break-inside: avoid;"><th style="border: 1px solid black; padding: 4px; width: 6%; white-space: nowrap;">Sumatif 1</th><th style="border: 1px solid black; padding: 4px; width: 6%; white-space: nowrap;">Sumatif 2</th></tr></thead><tbody>`;
    
    let no = 1;
    const renderRowHTML = (sub) => {
      const n = enr.nilai?.[sub.id] || {sumatif1: '', sumatif2: '', tercapai: '', belumTercapai: ''};
      const s1 = parseFloat(n.sumatif1) || ''; const s2 = parseFloat(n.sumatif2) || '';
      let avg = ''; if (s1 !== '' || s2 !== '') avg = Math.round((Number(s1) + Number(s2)) / (s1 !== '' && s2 !== '' ? 2 : 1));
      let capaianHtml = '';
      if (n.tercapai && n.belumTercapai) capaianHtml = `<div style="padding-bottom: 4px; border-bottom: 1px dashed black; margin-bottom: 4px;">${n.tercapai}</div><div>${n.belumTercapai}</div>`;
      else if (n.tercapai) capaianHtml = `<div>${n.tercapai}</div>`;
      else if (n.belumTercapai) capaianHtml = `<div>${n.belumTercapai}</div>`;
      else capaianHtml = `-`;
      return `<tr style="page-break-inside: avoid;"><td style="border: 1px solid black; padding: 4px; text-align: center; font-weight: bold;">${no++}</td><td style="border: 1px solid black; padding: 4px;">${sub.name}</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${s1}</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${s2}</td><td style="border: 1px solid black; padding: 4px; text-align: center; font-weight: bold; background-color: rgba(254, 202, 202, 0.3);">${avg}</td><td style="border: 1px solid black; padding: 5px 6px; text-align: justify; vertical-align: top; line-height: 1.4;">${capaianHtml}</td></tr>`;
    };
    if (subUmum.length === 0 && subLokal.length === 0) tNilaiHtml = '';
    else {
      subUmum.forEach(sub => { tNilaiHtml += renderRowHTML(sub); });
      if (subLokal.length > 0) { tNilaiHtml += `<tr style="background-color: #f3f4f6; page-break-inside: avoid;"><td colspan="6" style="border: 1px solid black; padding: 4px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Muatan Lokal</td></tr>`; subLokal.forEach(sub => { tNilaiHtml += renderRowHTML(sub); }); }
      tNilaiHtml += '</tbody></table>';
    }

    const sp = enr.specialData || { surah: [], hadist: [], doa: [], tilawah: [] };
    const fList = (arr) => { if(!arr || !Array.isArray(arr)) return '-'; const v = arr.filter(i => i.trim() !== ''); return v.length > 0 ? v.join('<br/>') : '-'; };
    
    // PEMBARUAN: Arial 10pt
    const tHafalanHtml = `<table style="font-family: Arial, sans-serif !important; font-size: 10pt !important; width: 100%; border-collapse: collapse; border: 1px solid black;"><thead style="display: table-header-group;"><tr style="background-color: #f3f4f6;"><th colspan="2" style="border: 1px solid black; padding: 4px;">HAFALAN</th></tr></thead><tbody><tr><td style="border: 1px solid black; padding: 4px; width: 60px; font-weight: bold; vertical-align: top;">Surah</td><td style="border: 1px solid black; padding: 4px; vertical-align: top;">${fList(sp.surah)}</td></tr><tr><td style="border: 1px solid black; padding: 4px; font-weight: bold; vertical-align: top;">Hadist</td><td style="border: 1px solid black; padding: 4px; vertical-align: top;">${fList(sp.hadist)}</td></tr><tr><td style="border: 1px solid black; padding: 4px; font-weight: bold; vertical-align: top;">Doa'</td><td style="border: 1px solid black; padding: 4px; vertical-align: top;">${fList(sp.doa)}</td></tr><tr style="background-color: #f3f4f6;"><th colspan="2" style="border: 1px solid black; padding: 4px;">TILAWAH</th></tr><tr><td colspan="2" style="border: 1px solid black; padding: 4px; text-align: center; font-weight: bold; vertical-align: top;">${fList(sp.tilawah)}</td></tr></tbody></table>`;

    const abs = enr.kehadiran || { sakit: 0, izin: 0, alpa: 0 };
    const fAbs = (val) => (val && Number(val) > 0) ? `${val} hari` : '-';
    
    // PEMBARUAN: Arial 10pt
    const tAbsensiHtml = `<table style="font-family: Arial, sans-serif !important; font-size: 10pt !important; width: 100%; border-collapse: collapse; border: 1px solid black;"><thead style="display: table-header-group;"><tr style="background-color: #f3f4f6;"><th colspan="2" style="border: 1px solid black; padding: 4px;">ABSENSI</th></tr></thead><tbody><tr><td style="border: 1px solid black; padding: 4px;">Sakit</td><td style="border: 1px solid black; padding: 4px; text-align: center; width: 30%;">${fAbs(abs.sakit)}</td></tr><tr><td style="border: 1px solid black; padding: 4px;">Izin</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${fAbs(abs.izin)}</td></tr><tr><td style="border: 1px solid black; padding: 4px;">Tanpa Keterangan</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${fAbs(abs.alpa)}</td></tr></tbody></table>`;

    const dataMap = {
      NAMA_SISWA: student.name, NISN: student.nisn, NIS: student.nis,
      KELAS: cls.name, FASE: getFase(cls.tingkat), TINGKAT: getTingkatFormat(cls.tingkat),
      NAMA_SEKOLAH: school.name, ALAMAT_SEKOLAH: school.address,
      TAHUN_AJARAN: enr.tahunAjaran, SEMESTER: enr.semester,
      KARAKTER: enr.karakter || '-', CATATAN_WALAS: enr.catatanWalas || '-',
      NAMA_KEPSEK: settings.kepalaSekolah, NIP_KEPSEK: settings.nipKepalaSekolah || '-',
      NAMA_WALAS: teacher.name, NIP_WALAS: teacher.nip || '-',
      TEMPAT_CETAK: settings.tempatCetak, TANGGAL_CETAK: formatTanggal(settings.tanggalCetak),
      TABEL_NILAI: tNilaiHtml, TABEL_HAFALAN: tHafalanHtml, TABEL_ABSENSI: tAbsensiHtml
    };

    html = html.replace(/\{\{([A-Z_]+)(?:\|([ULP]))?\}\}/g, (match, varName, modifier) => {
      let val = dataMap[varName];
      if (val === undefined || val === null) return match; 
      if (varName.startsWith('TABEL_')) return val;
      if (typeof val === 'string') {
        if (modifier === 'U') val = val.toUpperCase();
        else if (modifier === 'L') val = val.toLowerCase();
        else if (modifier === 'P') val = val.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
      }
      return val;
    });
    return html;
  };

  const getPreviewTemplateHTML = () => {
    try {
      const previewEnr = activeEnrollments.find(e => {
          const cls = classes.find(c => c.id === e.classId);
          return cls?.level === raporTab;
      });
      if (!previewEnr) return '<div class="p-8 text-center text-gray-500">Belum ada data siswa untuk di-preview di jenjang ini. Tambahkan siswa ke rombel terlebih dahulu.</div>';
      return compileHtmlRapor(previewEnr.id);
    } catch(err) {
      return `<div class="p-8 text-center text-red-500">Gagal memuat pratinjau: ${err.message}</div>`;
    }
  };

  // EXPORT EXCEL (Buku Leger)
  const handleExportExcel = () => {
    if (!selectedClassId) return alert("Pilih kelas terlebih dahulu!");
    const targetClass = classes.find(c => c.id === selectedClassId);
    
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => {
      const XLSX = window.XLSX;
      const classSubjects = subjects.filter(sub => sub.level === targetClass.level).sort((a,b) => (a.urutan || 0) - (b.urutan || 0));
      const myEnrs = activeEnrollments.filter(e => e.classId === selectedClassId);
      
      const dataNilai = myEnrs.map((enr, i) => {
        const s = students.find(std => std.id === enr.studentId) || {};
        let row = { 'No': i + 1, 'Nama Siswa': s.name, 'L/P': s.jk, 'NISN': s.nisn };

        classSubjects.forEach(sub => {
          const n = enr.nilai?.[sub.id] || {};
          const s1 = parseFloat(n.sumatif1) || 0;
          const s2 = parseFloat(n.sumatif2) || 0;
          let avg = '';
          if (n.sumatif1 !== '' || n.sumatif2 !== '') {
            const hitung = (s1 + s2) / ((n.sumatif1 !== '' && n.sumatif2 !== '') ? 2 : 1);
            avg = Number.isInteger(hitung) ? hitung.toString() : hitung.toFixed(1);
          }
          row[`Nilai: ${sub.name}`] = avg; 
          row[`Tercapai: ${sub.name}`] = n.tercapai || '';
          row[`Perlu Bimbingan: ${sub.name}`] = n.belumTercapai || '';
        });
        return row;
      });

      const dataHafalan = myEnrs.map((enr, i) => {
        const s = students.find(std => std.id === enr.studentId) || {};
        const sp = enr.specialData || { surah: [], hadist: [], doa: [], tilawah: [] };
        const format = (arr) => arr.filter(x => x.trim() !== '').join(' | ');
        return {
          'No': i + 1, 'Nama Siswa': s.name, 'L/P': s.jk, 'NISN': s.nisn,
          'Surah': format(sp.surah), 'Hadist': format(sp.hadist), 'Doa': format(sp.doa), 'Tilawah': format(sp.tilawah)
        };
      });

      const wsNilai = XLSX.utils.json_to_sheet(dataNilai);
      const wsHafalan = XLSX.utils.json_to_sheet(dataHafalan);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsNilai, "Rekap Nilai");
      XLSX.utils.book_append_sheet(wb, wsHafalan, "Hafalan & Tilawah");

      const cleanClassName = targetClass.name.replace(/[^a-z0-9]/gi, '_');
      XLSX.writeFile(wb, `Rekap_Kelas_${cleanClassName}_${activeTA.replace('/','-')}_${activeSemester}.xlsx`);
      showNotification("File Excel Buku Leger berhasil diunduh!");
    };
    document.body.appendChild(script);
  };

  // ==========================================
  // RENDER APP (FLAT STRUCTURE)
  // ==========================================
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-8 text-center">
            <BookOpen size={48} className="mx-auto text-white mb-3" />
            <h1 className="text-3xl font-bold text-white">e-Rapor</h1>
            <p className="text-blue-100 mt-2">Sistem Manajemen Akademik (Cloud)</p>
          </div>
          <div className="p-8">
            {systemWarning && (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm font-semibold flex items-start shadow-sm border border-yellow-200 mb-5 leading-relaxed">
                <span className="mr-3 text-xl">⚠️</span> {systemWarning}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold flex items-center shadow-sm border border-red-100">
                  <span className="mr-2">⚠️</span> {loginError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <div className="relative"><User className="absolute left-3 top-3 text-gray-400" size={20} /><input name="username" type="text" required className="w-full pl-10 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan username" /></div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={20} /><input name="password" type="password" required className="w-full pl-10 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" /></div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md">Masuk ke Sistem</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (printDataQueue && printDataQueue.length > 0) {
    const paperW = printConfig.paperSize === 'A4' ? '210mm' : '215mm';
    const paperH = printConfig.paperSize === 'A4' ? '297mm' : '330mm';
    
    const pad = `${printConfig.marginTop}mm ${printConfig.marginRight}mm ${printConfig.marginBottom}mm ${printConfig.marginLeft}mm`;
    const globalFont = raporSettings[raporTab]?.fontFamily || 'Arial, sans-serif';

    return (
      <div className="bg-gray-800 print:bg-transparent min-h-screen print:min-h-0 font-sans">
        <style>{`
          @media print {
            @page { size: ${paperW} ${paperH}; margin: ${pad} !important; }
            body, html { margin: 0 !important; padding: 0 !important; background-color: #fff !important; }
            .print-wrapper { padding: 0 !important; margin: 0 !important; background: transparent !important; }
            
            .print-page { 
              width: 100% !important; 
              max-width: 100% !important;
              min-height: auto !important; 
              padding: 0 !important; 
              box-shadow: none !important; 
              border: none !important; 
              margin: 0 !important; 
              page-break-after: always; 
              page-break-inside: avoid; 
              overflow: hidden !important; 
            }
            .print-page:last-child { page-break-after: auto; }
            
            .print-page img { display: inline-block !important; max-width: 100%; } 

            .no-print { display: none !important; }
            
            ::-webkit-scrollbar { display: none !important; }
            * { scrollbar-width: none !important; }
            [class*="codesandbox"],
            [id*="codesandbox"],
            [class*="csb"],
            [id*="csb"],
            [aria-label*="Sandbox"],
            [href*="codesandbox.io"],
            iframe,
            vercel-live-feedback { 
                display: none !important; 
                opacity: 0 !important; 
                visibility: hidden !important; 
                pointer-events: none !important;
                z-index: -9999 !important;
                height: 0 !important;
            }
          }
        `}</style>
        
        <div className="fixed top-0 w-full bg-white shadow-md p-4 flex justify-between items-center z-50 no-print">
          <div><h2 className="font-bold text-lg text-gray-800">Mode Cetak Rapor</h2><p className="text-sm text-gray-500">{printDataQueue.length} Siswa siap dicetak</p></div>
          <div className="flex space-x-3">
            <button onClick={() => setPrintDataQueue(null)} className="px-5 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Batal / Kembali</button>
            <button onClick={() => window.print()} className="px-5 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center"><Printer size={18} className="mr-2"/> Cetak (Ctrl+P)</button>
          </div>
        </div>

        <div className="pt-24 pb-12 print:pt-0 print:pb-0 print-wrapper">
          {printDataQueue.map((enrId) => (
            <div 
               key={enrId} 
               className="print-page bg-white shadow-2xl mx-auto relative overflow-visible mb-8 [&_img]:inline-block" 
               style={{ width: paperW, minHeight: paperH, padding: pad, fontFamily: globalFont, fontSize: '11pt', boxSizing: 'border-box' }} 
               dangerouslySetInnerHTML={{ __html: compileHtmlRapor(enrId) }} 
            />
          ))}
        </div>
      </div>
    );
  }

  const currentActiveMenu = activeMenu || (currentUser?.role === 'admin' ? 'admin-dashboard' : 'guru-dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* --- SIDEBAR MENU --- */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-blue-600 text-white md:bg-white md:text-gray-800">
          <div className="flex items-center space-x-2"><BookOpen size={24} className="md:text-blue-600" /><span className="text-lg font-bold">e-Rapor</span></div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1"><LogOut size={20} className="rotate-180" /></button>
        </div>
        
        <div className="p-4 border-b border-gray-100 flex items-center space-x-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{currentUser?.name?.charAt(0) || 'U'}</div>
          <div><p className="text-sm font-semibold text-gray-800 line-clamp-1">{currentUser?.name || 'Pengguna'}</p><p className="text-xs text-gray-500 uppercase">{currentUser?.role || 'Akses Terbatas'}</p></div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {currentUser?.role === 'admin' ? (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">Menu Admin</p>
              <div className="space-y-1">
                <button onClick={() => { setActiveMenu('admin-dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><LayoutDashboard size={18} /><span>Dashboard</span></button>
                <button onClick={() => { setActiveMenu('admin-sekolah'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-sekolah' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><Building size={18} /><span>Sekolah</span></button>
                <button onClick={() => { setActiveMenu('admin-tahun'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-tahun' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><CalendarDays size={18} /><span>Tahun Ajaran</span></button>
                <button onClick={() => { setActiveMenu('admin-guru'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-guru' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><UserPlus size={18} /><span>Guru</span></button>
                <button onClick={() => { setActiveMenu('admin-kelas'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-kelas' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><Database size={18} /><span>Kelas</span></button>
                <button onClick={() => { setActiveMenu('admin-siswa'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-siswa' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><Users size={18} /><span>Siswa</span></button>
                <button onClick={() => { setActiveMenu('admin-mapel'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-mapel' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><BookPlus size={18} /><span>Mata Pelajaran</span></button>
                <button onClick={() => { setActiveMenu('admin-cp'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-cp' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><ListChecks size={18} /><span>Bank CP</span></button>

                <div>
                  <button onClick={() => setIsNilaiExpanded(!isNilaiExpanded)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu.startsWith('admin-nilai') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="flex items-center space-x-3"><FileSpreadsheet size={18} /><span>Rekap Nilai</span></div>
                    <ChevronRight size={16} className={`transition-transform ${isNilaiExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {isNilaiExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      <button onClick={() => { setActiveMenu('admin-nilai-mapel'); setMobileMenuOpen(false); }} className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${currentActiveMenu === 'admin-nilai-mapel' || currentActiveMenu === 'admin-nilai' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>Mata Pelajaran</button>
                      <button onClick={() => { setActiveMenu('admin-nilai-hafalan'); setMobileMenuOpen(false); }} className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${currentActiveMenu === 'admin-nilai-hafalan' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>Hafalan & Tilawah</button>
                    </div>
                  )}
                </div>
                <button onClick={() => { setActiveMenu('admin-konsep-rapor'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-konsep-rapor' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><FileText size={18} /><span>Konsep Rapor</span></button>
                <button onClick={() => { setActiveMenu('admin-cetak'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-cetak' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><Printer size={18} /><span>Cetak Rapor</span></button>
                <button onClick={() => { setActiveMenu('admin-login'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-login' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><KeyRound size={18} /><span>Akses Login</span></button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">Menu {currentUser?.role || ''}</p>
              <div className="space-y-1">
                <button onClick={() => { setActiveMenu('guru-dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'guru-dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><LayoutDashboard size={18} /><span>Dashboard</span></button>
                <button onClick={() => { setActiveMenu('guru-cp'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'guru-cp' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><ListChecks size={18} /><span>Capaian Kompetensi</span></button>

                <div>
                  <button onClick={() => setIsNilaiExpanded(!isNilaiExpanded)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu.startsWith('guru-nilai') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="flex items-center space-x-3"><FileSpreadsheet size={18} /><span>Nilai</span></div>
                    <ChevronRight size={16} className={`transition-transform ${isNilaiExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {isNilaiExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      <button onClick={() => { setActiveMenu('guru-nilai-mapel'); setMobileMenuOpen(false); }} className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${currentActiveMenu === 'guru-nilai-mapel' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>Mata Pelajaran</button>
                      <button onClick={() => { setActiveMenu('guru-nilai-hafalan'); setMobileMenuOpen(false); }} className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${currentActiveMenu === 'guru-nilai-hafalan' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>Hafalan & Tilawah</button>
                    </div>
                  )}
                </div>

                {currentUser?.role === 'wali kelas' && (
                  <div>
                    <button onClick={() => setIsWaliExpanded(!isWaliExpanded)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${(currentActiveMenu === 'guru-kehadiran' || currentActiveMenu === 'guru-catatan' || currentActiveMenu === 'guru-rekap-nilai' || currentActiveMenu === 'guru-rekap-hafalan') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <div className="flex items-center space-x-3"><UserCheck size={18} /><span>Wali Kelas</span></div>
                      <ChevronRight size={16} className={`transition-transform ${isWaliExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    {isWaliExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        <button onClick={() => { setActiveMenu('guru-kehadiran'); setMobileMenuOpen(false); }} className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${currentActiveMenu === 'guru-kehadiran' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>Kehadiran Siswa</button>
                        <button onClick={() => { setActiveMenu('guru-catatan'); setMobileMenuOpen(false); }} className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${currentActiveMenu === 'guru-catatan' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>Karakter & Catatan</button>
                        <button onClick={() => { setActiveMenu('guru-rekap-nilai'); setMobileMenuOpen(false); }} className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${currentActiveMenu === 'guru-rekap-nilai' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>Rekap Nilai Mapel</button>
                        <button onClick={() => { setActiveMenu('guru-rekap-hafalan'); setMobileMenuOpen(false); }} className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${currentActiveMenu === 'guru-rekap-hafalan' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>Rekap Hafalan & Tilawah</button>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => { setActiveMenu('admin-cetak'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${currentActiveMenu === 'admin-cetak' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><Printer size={18} /><span>Cetak Rapor</span></button>
              </div>
            </>
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"><LogOut size={18} /><span className="font-medium">Keluar</span></button>
        </div>
      </div>

      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* --- AREA KONTEN KANAN --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-3">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full md:hidden"><Menu size={24} /></button>
            <h2 className="text-lg font-bold text-gray-800">
              {currentUser?.role === 'admin' ? 'Sistem Manajemen Admin' : (activeClass ? `Dashboard ${currentUser?.role || ''} - ${activeClass.name}` : `Dashboard ${currentUser?.role || ''}`)}
            </h2>
          </div>
          <div className="hidden md:flex flex-col text-right">
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Periode Aktif Sistem</span>
             <span className="text-sm font-bold text-blue-600">{activeTA} - {activeSemester}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 w-full">
          
          {/* =========================================================
              KONTEN DINAMIS BERDASARKAN MENU (FLAT STRUCTURE)
              ========================================================= */}
          
          {currentActiveMenu === 'admin-dashboard' && (() => {
            const tSD = teachers.filter(t => t.level === 'SD').length;
            const tSMP = teachers.filter(t => t.level === 'SMP').length;
            const tSMA = teachers.filter(t => t.level === 'SMA').length;
            const sSD = activeEnrollments.filter(e => classes.find(c => c.id === e.classId)?.level === 'SD').length;
            const sSMP = activeEnrollments.filter(e => classes.find(c => c.id === e.classId)?.level === 'SMP').length;
            const sSMA = activeEnrollments.filter(e => classes.find(c => c.id === e.classId)?.level === 'SMA').length;
            const calculateProgress = (level) => {
              const lvlClassIds = classes.filter(c => c.level === level).map(c => c.id);
              const activeLvlEnrs = activeEnrollments.filter(e => lvlClassIds.includes(e.classId));
              const lvlSubs = subjects.filter(sub => sub.level === level);
              if (activeLvlEnrs.length === 0 || lvlSubs.length === 0) return null;
              let target = activeLvlEnrs.length * lvlSubs.length; let filled = 0;
              activeLvlEnrs.forEach(enr => { lvlSubs.forEach(sub => { if (enr.nilai && enr.nilai[sub.id] && (enr.nilai[sub.id].sumatif1 !== '' || enr.nilai[sub.id].sumatif2 !== '')) filled++; }); });
              return { target, filled, percentage: Math.round((filled / target) * 100) };
            };
            const progSD = calculateProgress('SD'); const progSMP = calculateProgress('SMP'); const progSMA = calculateProgress('SMA');

            return (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row items-center justify-between border-b-4 border-yellow-400">
                   <div>
                      <h3 className="text-xl font-bold text-yellow-300 flex items-center"><BookOpen className="mr-2"/> Jantung Sistem (Periode Aktif)</h3>
                      <p className="text-sm text-blue-200 mt-1">Ganti periode di sini untuk membuka arsip masa lalu atau beralih ke tahun ajaran baru.</p>
                   </div>
                   <div className="flex items-center space-x-3 mt-4 md:mt-0">
                      <select value={activeTA} onChange={e => setActiveTA(e.target.value)} className="bg-white text-blue-900 rounded-lg p-2.5 font-bold outline-none shadow-sm cursor-pointer border-0">
                         {academicYears.map(ta => <option key={ta} value={ta}>{ta}</option>)}
                      </select>
                      <select value={activeSemester} onChange={e => setActiveSemester(e.target.value)} className="bg-white text-blue-900 rounded-lg p-2.5 font-bold outline-none shadow-sm cursor-pointer border-0">
                         <option value="Ganjil">Semester Ganjil</option><option value="Genap">Semester Genap</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div><p className="text-gray-500 text-sm font-semibold mb-1">Total Guru</p><h3 className="text-3xl font-bold text-blue-600">{teachers.length}</h3></div><div className="p-3 bg-blue-50 rounded-xl"><UserPlus className="text-blue-500" size={32} /></div></div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div><p className="text-gray-500 text-sm font-semibold mb-1">Siswa Aktif</p><h3 className="text-3xl font-bold text-green-600">{activeEnrollments.length}</h3></div><div className="p-3 bg-green-50 rounded-xl"><Users className="text-green-500" size={32} /></div></div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div><p className="text-gray-500 text-sm font-semibold mb-1">Total Kelas</p><h3 className="text-3xl font-bold text-purple-600">{classes.length}</h3></div><div className="p-3 bg-purple-50 rounded-xl"><Database className="text-purple-500" size={32} /></div></div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div><p className="text-gray-500 text-sm font-semibold mb-1">Mata Pelajaran</p><h3 className="text-3xl font-bold text-orange-600">{subjects.length}</h3></div><div className="p-3 bg-orange-50 rounded-xl"><BookPlus className="text-orange-500" size={32} /></div></div>
                </div>
              </div>
            );
          })()}

          {currentActiveMenu === 'guru-dashboard' && (() => {
            const isWali = currentUser?.role === 'wali kelas';
            const isGuruMapel = currentUser?.role === 'guru' || currentUser?.role === 'wali kelas';
            
            let myStudentsCount = 0;
            let progress = { target: 0, filled: 0, percentage: 0 };
            
            if (isWali && activeClass) {
              const myEnrs = activeEnrollments.filter(e => e.classId === activeClass.id);
              myStudentsCount = myEnrs.length;
            }

            const mySubs = subjects.filter(s => s.teacherId === currentUser?.teacherId);
            const myLevels = [...new Set(mySubs.map(s => s.level))];
            const myClasses = classes.filter(c => myLevels.includes(c.level));
            const myClassIds = myClasses.map(c => c.id);
            
            const myEnrsMapel = activeEnrollments.filter(e => myClassIds.includes(e.classId));
            if (!isWali) myStudentsCount = myEnrsMapel.length; // Guru mapel hitung dari seluruh mapelnya

            progress.target = myEnrsMapel.length * mySubs.length;
            
            myEnrsMapel.forEach(enr => {
              mySubs.forEach(sub => {
                if (enr.nilai?.[sub.id] && (enr.nilai[sub.id].sumatif1 !== '' || enr.nilai[sub.id].sumatif2 !== '')) {
                  progress.filled++;
                }
              });
            });
            progress.percentage = progress.target > 0 ? Math.round((progress.filled / progress.target) * 100) : 0;

            return (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-xl mb-2 flex items-center"><LayoutDashboard className="mr-2 text-blue-600"/> Dashboard {isWali ? 'Wali Kelas' : 'Guru Mata Pelajaran'}</h3>
                  <p className="text-gray-600">Selamat datang kembali, <strong>{currentUser?.name}</strong>.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between">
                     <div>
                       <p className="text-blue-100 text-sm font-semibold mb-1">{isWali ? 'Siswa Kelas Anda' : 'Total Siswa Diajar'}</p>
                       <h3 className="text-4xl font-bold">{myStudentsCount}</h3>
                     </div>
                     <Users size={32} className="text-blue-200 self-end mt-4 opacity-50"/>
                   </div>
                   
                   <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between lg:col-span-2">
                     <div>
                       <p className="text-green-100 text-sm font-semibold mb-1">Progres Pengisian Nilai Mapel (Periode Berjalan)</p>
                       <div className="flex justify-between items-end mb-2">
                         <h3 className="text-3xl font-bold">{progress.percentage}%</h3>
                         <span className="text-sm font-medium text-green-100">{progress.filled} dari {progress.target} Data Nilai</span>
                       </div>
                       <div className="w-full bg-green-800/50 rounded-full h-3">
                         <div className="bg-white h-3 rounded-full transition-all duration-1000" style={{ width: `${progress.percentage}%` }}></div>
                       </div>
                     </div>
                     {progress.percentage === 100 && <p className="text-xs text-green-100 mt-4 flex items-center"><CheckCircle size={14} className="mr-1"/> Pengisian nilai telah selesai.</p>}
                   </div>
                </div>

                {isWali && activeClass && (
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                      <h4 className="font-bold text-gray-800 border-b pb-3 mb-4">Informasi Rombel Anda</h4>
                      <p><strong>Kelas:</strong> {activeClass.name}</p>
                      <p><strong>Tingkat:</strong> {activeClass.tingkat}</p>
                      <p><strong>Fase:</strong> {getFase(activeClass.tingkat)}</p>
                   </div>
                )}

                {mySubs.length > 0 && (
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                      <h4 className="font-bold text-gray-800 border-b pb-3 mb-4">Mata Pelajaran yang Anda Ampu</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {mySubs.map(sub => <li key={sub.id}>{sub.name} <span className="font-bold text-blue-600">({sub.level})</span></li>)}
                      </ul>
                   </div>
                )}
              </div>
            );
          })()}

          {currentActiveMenu === 'admin-tahun' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                <h3 className="font-bold text-xl mb-4 flex items-center"><CalendarDays className="mr-2 text-blue-600"/> Tambah Tahun Ajaran</h3>
                <form onSubmit={handleAddTA} className="space-y-4">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Ajaran Baru</label><input type="text" required value={newTAForm} onChange={e => setNewTAForm(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Misal: 2027/2028" /></div>
                  <button onClick={handleAddTA} className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"><PlusCircle size={18} className="mr-2"/> Tambahkan</button>
                </form>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2">
                <h3 className="font-bold text-xl text-gray-800 mb-4">Daftar Tahun Ajaran Sistem</h3>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-gray-100 text-gray-700 text-sm"><th className="p-3 border-b font-semibold w-12 text-center">No</th><th className="p-3 border-b font-semibold">Tahun Ajaran</th><th className="p-3 border-b font-semibold text-center">Status Dashboard</th><th className="p-3 border-b font-semibold text-center w-28">Aksi</th></tr></thead>
                    <tbody>
                      {academicYears.map((ta, idx) => (
                        <tr key={ta} className="border-b hover:bg-gray-50 text-sm">
                          <td className="p-3 text-center">{idx + 1}</td><td className="p-3 font-bold text-gray-800">{ta}</td>
                          <td className="p-3 text-center">{ta === activeTA ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Sedang Aktif</span> : <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-bold">Arsip</span>}</td>
                          <td className="p-3 flex justify-center"><button onClick={() => handleDeleteTA(ta)} className={`p-1.5 rounded ${ta === activeTA ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentActiveMenu === 'admin-sekolah' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl flex items-center"><Building className="mr-2 text-blue-600"/> Data Sekolah</h3>
                {schoolView === 'table' && <button onClick={() => { setSchoolForm({id:'', name:'', npsn:'', address:'', level:'SD'}); setIsEditingSchool(false); setSchoolView('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><PlusCircle size={18} className="mr-2" /> Tambah Data</button>}
              </div>
              {schoolView === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-gray-100 text-gray-700 text-sm"><th className="p-3 border-b font-semibold w-12 text-center">No</th><th className="p-3 border-b font-semibold">Nama Sekolah</th><th className="p-3 border-b font-semibold">NPSN</th><th className="p-3 border-b font-semibold">Alamat Sekolah</th><th className="p-3 border-b font-semibold">Jenjang</th><th className="p-3 border-b font-semibold text-center w-28">Aksi</th></tr></thead>
                    <tbody>
                      {schools.map((school, idx) => (
                        <tr key={school.id} className="border-b hover:bg-gray-50 text-sm">
                          <td className="p-3 text-center">{idx + 1}</td><td className="p-3 font-medium">{school.name}</td><td className="p-3 text-gray-600">{school.npsn}</td><td className="p-3 text-gray-600 max-w-xs truncate">{school.address}</td>
                          <td className="p-3"><span className="px-2 py-1 rounded text-xs font-bold bg-gray-200 text-gray-700">{school.level}</span></td>
                          <td className="p-3 flex justify-center space-x-2">
                            <button onClick={() => {setSchoolForm(school); setIsEditingSchool(true); setSchoolView('form');}} className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteSchool(school.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <form onSubmit={handleSaveSchool} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">{isEditingSchool ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru'}</h4>
                  <input type="text" required value={schoolForm.name} onChange={e => setSchoolForm({...schoolForm, name: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="Nama Sekolah" />
                  <input type="text" required value={schoolForm.npsn} onChange={e => setSchoolForm({...schoolForm, npsn: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="NPSN" />
                  <textarea required value={schoolForm.address} onChange={e => setSchoolForm({...schoolForm, address: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="Alamat" />
                  <select value={schoolForm.level} onChange={e => setSchoolForm({...schoolForm, level: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none"><option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option></select>
                  <div className="flex space-x-3 pt-4"><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">Simpan</button><button type="button" onClick={() => setSchoolView('table')} className="bg-gray-200 px-5 py-2 rounded-lg">Batal</button></div>
                </form>
              )}
            </div>
          )}

          {currentActiveMenu === 'admin-guru' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl flex items-center"><UserPlus className="mr-2 text-blue-600"/> Profil Data Guru</h3>
                {teacherView === 'table' && <button onClick={() => { setTeacherFormState({id:'', name:'', jk:'L', nip:'', level: teacherTab}); setIsEditingTeacher(false); setTeacherView('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><PlusCircle size={18} className="mr-2" /> Tambah Guru</button>}
              </div>
              {teacherView === 'table' ? (
                <>
                  {renderTabs(teacherTab, setTeacherTab)}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-gray-100 text-gray-700 text-sm"><th className="p-3 border-b font-semibold w-12 text-center">No</th><th className="p-3 border-b font-semibold">Nama Guru</th><th className="p-3 border-b font-semibold text-center w-24">JK</th><th className="p-3 border-b font-semibold">NIP/NIY</th><th className="p-3 border-b font-semibold text-center">Jenjang Base</th><th className="p-3 border-b font-semibold text-center w-28">Aksi</th></tr></thead>
                      <tbody>
                        {teachers.filter(t => t.level === teacherTab).length === 0 ? (
                          <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada data guru jenjang {teacherTab}.</td></tr>
                        ) : (
                          teachers.filter(t => t.level === teacherTab).map((guru, idx) => (
                            <tr key={guru.id} className="border-b hover:bg-gray-50 text-sm">
                              <td className="p-3 text-center">{idx + 1}</td><td className="p-3 font-medium">{guru.name}</td><td className="p-3 text-center">{guru.jk}</td><td className="p-3 text-gray-600">{guru.nip || '-'}</td>
                              <td className="p-3 text-center"><span className="px-2 py-1 rounded text-xs font-bold bg-gray-200">{guru.level}</span></td>
                              <td className="p-3 flex justify-center space-x-2">
                                <button onClick={() => {setTeacherFormState(guru); setIsEditingTeacher(true); setTeacherView('form');}} className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"><Edit size={16} /></button>
                                <button onClick={() => handleDeleteTeacher(guru.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveTeacher} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">{isEditingTeacher ? 'Edit Profil Guru' : `Tambah Guru Baru (${teacherTab})`}</h4>
                  <input type="text" disabled value={teacherTab} className="w-1/4 mb-2 p-2.5 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed text-center font-bold" />
                  <input type="text" required value={teacherFormState.name} onChange={e => setTeacherFormState({...teacherFormState, name: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="Nama Guru beserta gelar" />
                  <input type="text" value={teacherFormState.nip} onChange={e => setTeacherFormState({...teacherFormState, nip: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="NIP / NIY" />
                  <select required value={teacherFormState.jk} onChange={e => setTeacherFormState({...teacherFormState, jk: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none"><option value="L">Laki-laki (L)</option><option value="P">Perempuan (P)</option></select>
                  <div className="flex space-x-3 pt-4"><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">Simpan</button><button type="button" onClick={() => setTeacherView('table')} className="bg-gray-200 px-5 py-2 rounded-lg">Batal</button></div>
                </form>
              )}
            </div>
          )}

          {currentActiveMenu === 'admin-kelas' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl flex items-center"><Database className="mr-2 text-blue-600"/> Data Kelas</h3>
                {classView === 'table' && <button onClick={() => { setClassFormState({id:'', name:'', level: classTab, tingkat:'', teacherId:''}); setIsEditingClass(false); setClassView('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><PlusCircle size={18} className="mr-2" /> Tambah Kelas</button>}
              </div>
              {classView === 'table' ? (
                <>
                  {renderTabs(classTab, setClassTab)}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-gray-100 text-gray-700 text-sm"><th className="p-3 border-b font-semibold w-12 text-center">No</th><th className="p-3 border-b font-semibold">Jenjang</th><th className="p-3 border-b font-semibold text-center">Tingkat</th><th className="p-3 border-b font-semibold">Nama Kelas</th><th className="p-3 border-b font-semibold">Nama Wali Kelas</th><th className="p-3 border-b font-semibold text-center">Siswa Aktif</th><th className="p-3 border-b font-semibold text-center w-36">Aksi</th></tr></thead>
                      <tbody>
                        {classes.filter(c => c.level === classTab).length === 0 ? (
                           <tr><td colSpan="7" className="p-8 text-center text-gray-500">Belum ada data kelas.</td></tr>
                        ) : (
                          classes.filter(c => c.level === classTab).map((cls, idx) => {
                            const teacher = teachers.find(t => t.id === cls.teacherId) || { name: '-' };
                            const studentCount = activeEnrollments.filter(e => e.classId === cls.id).length;
                            return (
                              <tr key={cls.id} className="border-b hover:bg-gray-50 text-sm">
                                <td className="p-3 text-center">{idx + 1}</td>
                                <td className="p-3"><span className="px-2 py-1 rounded text-xs font-bold bg-gray-200">{cls.level}</span></td>
                                <td className="p-3 text-center font-bold text-blue-600">{cls.tingkat}</td>
                                <td className="p-3 font-medium">{cls.name}</td>
                                <td className="p-3 text-gray-600">{teacher.name}</td>
                                <td className="p-3 text-center font-medium bg-blue-50/50">{studentCount}</td>
                                <td className="p-3 flex justify-center space-x-2">
                                  <button onClick={() => { setActiveRombelClass(cls); setClassView('rombel'); }} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Atur Siswa (Rombel)"><UserCheck size={16} /></button>
                                  <button onClick={() => {setClassFormState(cls); setIsEditingClass(true); setClassView('form');}} className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"><Edit size={16} /></button>
                                  <button onClick={() => handleDeleteClass(cls.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : classView === 'form' ? (
                <form onSubmit={handleSaveClass} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">{isEditingClass ? 'Edit Kelas' : `Tambah Kelas (${classTab})`}</h4>
                  <div className="flex space-x-4">
                    <input type="text" disabled value={classTab} className="w-1/4 p-2.5 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed text-center font-bold" />
                    <input type="number" required value={classFormState.tingkat} onChange={e => setClassFormState({...classFormState, tingkat: e.target.value})} className="w-1/4 p-2.5 border rounded-lg outline-none" placeholder="Tingkat (1, 2, 7)" />
                    <input type="text" required value={classFormState.name} onChange={e => setClassFormState({...classFormState, name: e.target.value})} className="w-2/4 p-2.5 border rounded-lg outline-none" placeholder="Nama Kelas (ex: 1A)" />
                  </div>
                  <select value={classFormState.teacherId} onChange={e => setClassFormState({...classFormState, teacherId: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none">
                    <option value="">-- Pilih Wali Kelas (Opsional) --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.level})</option>)}
                  </select>
                  <div className="flex space-x-3 pt-4"><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">Simpan</button><button type="button" onClick={() => setClassView('table')} className="bg-gray-200 px-5 py-2 rounded-lg">Batal</button></div>
                </form>
              ) : classView === 'rombel' && activeRombelClass ? (
                <div className="max-w-3xl bg-white border border-blue-100 p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <div>
                      <h4 className="font-bold text-xl text-blue-700">Atur Rombel: {activeRombelClass.name}</h4>
                      <p className="text-sm text-gray-500">Masa Aktif: <span className="font-bold">{activeTA} - {activeSemester}</span></p>
                    </div>
                    <button onClick={() => setClassView('table')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Kembali</button>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {students.filter(s => s.level === activeRombelClass.level).length === 0 ? (
                       <p className="text-center text-gray-400 py-8">Tidak ada data siswa master untuk jenjang ini.</p>
                    ) : (
                      students.filter(s => s.level === activeRombelClass.level).map(std => {
                        const studentEnrollment = activeEnrollments.find(e => e.studentId === std.id);
                        const isEnrolled = studentEnrollment?.classId === activeRombelClass.id;
                        
                        // Pastikan kelas lain itu benar-benar ADA di database (bukan kelas hantu yang sudah terhapus)
                        const enrolledClassExists = studentEnrollment ? classes.some(c => c.id === studentEnrollment.classId) : false;
                        const isEnrolledInOther = studentEnrollment && studentEnrollment.classId !== activeRombelClass.id && enrolledClassExists;

                        const handleToggleRombel = async () => {
                           if (isEnrolled) {
                             await deleteDoc(docPath('enrollments', studentEnrollment.id));
                           } else {
                             // Bersihkan enrollment hantu/lama jika ada sebelum membuat yang baru
                             if (studentEnrollment) {
                               await deleteDoc(docPath('enrollments', studentEnrollment.id));
                             }
                             const newEnr = {
                               id: 'enr-' + Date.now(), studentId: std.id, classId: activeRombelClass.id,
                               tahunAjaran: activeTA, semester: activeSemester,
                               kehadiran: { sakit: 0, izin: 0, alpa: 0 }, nilai: {},
                               specialData: { surah: [''], hadist: [''], doa: [''], tilawah: [''] },
                               karakter: '', catatanWalas: ''
                             };
                             await setDoc(docPath('enrollments', newEnr.id), newEnr);
                           }
                        };

                        return (
                          <div key={std.id} className={`flex justify-between items-center p-4 border rounded-xl transition-colors ${isEnrolled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-white'}`}>
                            <div><p className="font-bold text-gray-800">{std.name}</p><p className="text-sm text-gray-500">NISN: {std.nisn} | NIS: {std.nis}</p></div>
                            <div>
                              {isEnrolledInOther ? (
                                <span className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium">Di Kelas Lain</span>
                              ) : (
                                <button 
                                  onClick={handleToggleRombel}
                                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-transform active:scale-95 ${isEnrolled ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                >
                                  {isEnrolled ? 'Keluarkan' : 'Masukkan'}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {currentActiveMenu === 'admin-siswa' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl flex items-center"><Users className="mr-2 text-blue-600"/> Data Induk Siswa</h3>
                {studentView === 'table' && (
                  <div className="flex space-x-2">
                    <button onClick={() => setShowImportModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-green-700"><FileUp size={18} className="mr-2" /> Import Excel</button>
                    <button onClick={() => { setStudentFormState({id:'', name:'', jk:'L', nisn:'', nis:'', level: studentTab}); setIsEditingStudent(false); setStudentView('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><PlusCircle size={18} className="mr-2" /> Tambah Siswa</button>
                  </div>
                )}
              </div>
              
              {showImportModal && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                   <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                     <div className="bg-green-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold text-lg flex items-center"><FileUp className="mr-2"/> Import Siswa Jenjang {studentTab}</h3><button onClick={() => setShowImportModal(false)}>X</button></div>
                     <div className="p-6 flex-1 overflow-y-auto">
                        <p className="text-sm text-gray-600 mb-4">Silakan <b>Copy (Salin)</b> data dari Microsoft Excel lalu <b>Paste (Tempel)</b> ke dalam kotak di bawah ini.</p>
                        <p className="text-xs font-bold text-gray-700 bg-yellow-50 p-2 border border-yellow-200 rounded mb-2">Pastikan format urutan kolom Excel Anda: NAMA | L/P | NISN | NIS</p>
                        <textarea 
                           className="w-full h-64 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm whitespace-pre"
                           placeholder="ANDI M&#9;L&#9;0123456789&#9;1001&#10;SITI A&#9;P&#9;0123456790&#9;1002"
                           value={importText}
                           onChange={e => setImportText(e.target.value)}
                        ></textarea>
                     </div>
                     <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                        <button onClick={() => setShowImportModal(false)} className="px-5 py-2 rounded-lg bg-gray-200 font-bold text-gray-700">Batal</button>
                        <button onClick={handleImportSiswaSubmit} className="px-5 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700">Proses Import</button>
                     </div>
                   </div>
                 </div>
              )}

              {studentView === 'table' ? (
                <>
                  {renderTabs(studentTab, setStudentTab)}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-gray-100 text-gray-700 text-sm"><th className="p-3 border-b font-semibold w-12 text-center">No</th><th className="p-3 border-b font-semibold">Nama Siswa</th><th className="p-3 border-b font-semibold text-center">JK</th><th className="p-3 border-b font-semibold">NISN</th><th className="p-3 border-b font-semibold">NIS</th><th className="p-3 border-b font-semibold text-center">Kelas Aktif Saat Ini</th><th className="p-3 border-b font-semibold text-center w-28">Aksi</th></tr></thead>
                      <tbody>
                        {students.filter(s => s.level === studentTab).length === 0 ? (
                          <tr><td colSpan="7" className="p-8 text-center text-gray-500">Belum ada siswa terdaftar di {studentTab}.</td></tr>
                        ) : (
                          students.filter(s => s.level === studentTab).map((std, idx) => {
                            const activeEnr = activeEnrollments.find(e => e.studentId === std.id);
                            const clsName = activeEnr ? classes.find(c => c.id === activeEnr.classId)?.name : <span className="text-red-500">Belum Masuk Kelas</span>;
                            return (
                              <tr key={std.id} className="border-b hover:bg-gray-50 text-sm">
                                <td className="p-3 text-center">{idx + 1}</td><td className="p-3 font-medium">{std.name}</td><td className="p-3 text-center">{std.jk}</td><td className="p-3 text-gray-600">{std.nisn}</td><td className="p-3 text-gray-600">{std.nis}</td>
                                <td className="p-3 text-center font-semibold">{clsName}</td>
                                <td className="p-3 flex justify-center space-x-2">
                                  <button onClick={() => {setStudentFormState(std); setIsEditingStudent(true); setStudentView('form');}} className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"><Edit size={16} /></button>
                                  <button onClick={() => handleDeleteStudent(std.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveStudent} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800 mb-4">
                    <b>Info:</b> Formulir ini mendaftarkan Biodata Induk. Jika siswa lulus/naik jenjang, Anda bisa mengubah pilihan <b>Jenjang Pendidikan</b> di bawah ini.
                  </div>
                  <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">{isEditingStudent ? 'Edit Siswa (Pindah Jenjang / Biodata)' : `Tambah Siswa (${studentTab})`}</h4>
                  <input type="text" required value={studentFormState.name} onChange={e => setStudentFormState({...studentFormState, name: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="Nama Lengkap Siswa" />
                  <div className="flex space-x-4">
                    <select required value={studentFormState.jk} onChange={e => setStudentFormState({...studentFormState, jk: e.target.value})} className="w-1/3 p-2.5 border rounded-lg outline-none"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select>
                    <input type="text" required maxLength="10" value={studentFormState.nisn} onChange={e => setStudentFormState({...studentFormState, nisn: e.target.value.replace(/\D/g, '')})} className="w-1/3 p-2.5 border rounded-lg outline-none" placeholder="NISN (Maks 10 Angka)" />
                    <input type="text" required value={studentFormState.nis} onChange={e => setStudentFormState({...studentFormState, nis: e.target.value})} className="w-1/3 p-2.5 border rounded-lg outline-none" placeholder="NIS" />
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                       <label className="block text-xs font-bold text-gray-600 mb-1">Jenjang Pendidikan Siswa Saat Ini</label>
                       <select required value={studentFormState.level || studentTab} onChange={e => setStudentFormState({...studentFormState, level: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none font-bold text-blue-700 bg-blue-50">
                          <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option>
                       </select>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4"><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">Simpan Biodata</button><button type="button" onClick={() => setStudentView('table')} className="bg-gray-200 px-5 py-2 rounded-lg">Batal</button></div>
                </form>
              )}
            </div>
          )}

          {currentActiveMenu === 'admin-mapel' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl flex items-center"><BookPlus className="mr-2 text-blue-600"/> Mata Pelajaran</h3>
                {subjectView === 'table' && <button onClick={() => { setSubjectFormState({id:'', name:'', level: subjectTab, teacherId:'', isLokal: false}); setIsEditingSubject(false); setSubjectView('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><PlusCircle size={18} className="mr-2" /> Tambah Mapel</button>}
              </div>
              {subjectView === 'table' ? (
                <>
                  {renderTabs(subjectTab, setSubjectTab)}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-gray-100 text-gray-700 text-sm"><th className="p-3 border-b font-semibold w-12 text-center">No</th><th className="p-3 border-b font-semibold text-center w-20">Urutan</th><th className="p-3 border-b font-semibold">Mata Pelajaran</th><th className="p-3 border-b font-semibold text-center w-28">Kategori</th><th className="p-3 border-b font-semibold">Guru Pengampu</th><th className="p-3 border-b font-semibold text-center w-28">Aksi</th></tr></thead>
                      <tbody>
                        {subjects.filter(s => s.level === subjectTab).length === 0 ? (
                           <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada mata pelajaran jenjang {subjectTab}.</td></tr>
                        ) : (
                          subjects.filter(s => s.level === subjectTab).sort((a,b) => (a.urutan || 0) - (b.urutan || 0)).map((sub, idx) => {
                            const teacher = teachers.find(t => t.id === sub.teacherId) || { name: '-' };
                            return (
                              <tr key={sub.id} className="border-b hover:bg-gray-50 text-sm">
                                <td className="p-3 text-center">{idx + 1}</td>
                                <td className="p-3 text-center font-bold text-blue-600">{sub.urutan || '-'}</td>
                                <td className="p-3 font-medium text-gray-800">{sub.name}</td>
                                <td className="p-3 text-center">
                                  {sub.isLokal ? <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Muatan Lokal</span> : <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Umum</span>}
                                </td>
                                <td className="p-3 text-gray-600">{teacher.name}</td>
                                <td className="p-3 flex justify-center space-x-2">
                                  <button onClick={() => {setSubjectFormState(sub); setIsEditingSubject(true); setSubjectView('form');}} className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"><Edit size={16} /></button>
                                  <button onClick={() => handleDeleteSubject(sub.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveSubject} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">{isEditingSubject ? 'Edit Mata Pelajaran' : `Tambah Mata Pelajaran (${subjectTab})`}</h4>
                  <div className="flex space-x-3 mb-2">
                    <input type="text" disabled value={subjectTab} className="w-1/4 p-2.5 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed text-center font-bold" />
                    <input type="number" required value={subjectFormState.urutan || ''} onChange={e => setSubjectFormState({...subjectFormState, urutan: parseInt(e.target.value) || ''})} className="w-1/4 p-2.5 border rounded-lg outline-none" placeholder="Urutan (cth: 1)" title="Urutan tampil di rapor" />
                    <input type="text" required value={subjectFormState.name} onChange={e => {
                      const val = e.target.value; const lowerVal = val.toLowerCase();
                      const mulokKeywords = ['inggris', 'arab', 'daerah', 'mulok', 'lokal', 'tahfidz', 'komputer', 'tik', 'prakarya', 'jepang', 'mandarin', 'tari'];
                      const isDetectedLokal = mulokKeywords.some(kw => lowerVal.includes(kw));
                      setSubjectFormState({...subjectFormState, name: val, isLokal: isDetectedLokal});
                    }} className="w-2/4 p-2.5 border rounded-lg outline-none" placeholder="Nama Mapel" />
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 border rounded-lg">
                    <input type="checkbox" id="isLokal" checked={subjectFormState.isLokal} onChange={e => setSubjectFormState({...subjectFormState, isLokal: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <label htmlFor="isLokal" className="text-sm font-medium text-gray-700 cursor-pointer">Tandai sebagai Muatan Lokal</label>
                  </div>
                  <select required value={subjectFormState.teacherId} onChange={e => setSubjectFormState({...subjectFormState, teacherId: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none">
                    <option value="">-- Pilih Guru Pengampu --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.level})</option>)}
                  </select>
                  <div className="flex space-x-3 pt-4"><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">Simpan</button><button type="button" onClick={() => setSubjectView('table')} className="bg-gray-200 px-5 py-2 rounded-lg">Batal</button></div>
                </form>
              )}
            </div>
          )}

          {currentActiveMenu === 'admin-login' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl flex items-center"><KeyRound className="mr-2 text-blue-600"/> Manajemen Login</h3>
                {loginView === 'table' && <button onClick={() => { setLoginFormState({id:'', username:'', password:'', role:'guru', teacherId:''}); setIsEditingLogin(false); setLoginView('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><PlusCircle size={18} className="mr-2" /> Buat Akun</button>}
              </div>
              {loginView === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-gray-100 text-gray-700 text-sm"><th className="p-3 border-b font-semibold w-12 text-center">No</th><th className="p-3 border-b font-semibold">Username</th><th className="p-3 border-b font-semibold">Password</th><th className="p-3 border-b font-semibold text-center">Role Akses</th><th className="p-3 border-b font-semibold">Pemilik Akun</th><th className="p-3 border-b font-semibold text-center w-28">Aksi</th></tr></thead>
                    <tbody>
                      {users.map((acc, idx) => {
                        const accOwner = acc.role === 'admin' ? 'Administrator System' : (teachers.find(t => t.id === acc.teacherId)?.name || 'Guru Tidak Ditemukan');
                        return (
                          <tr key={acc.id} className="border-b hover:bg-gray-50 text-sm">
                            <td className="p-3 text-center">{idx + 1}</td><td className="p-3 font-medium text-blue-600">{acc.username}</td><td className="p-3 font-mono text-gray-500">{acc.password}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${acc.role === 'admin' ? 'bg-red-100 text-red-700' : acc.role === 'wali kelas' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                {acc.role}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600">{accOwner}</td>
                            <td className="p-3 flex justify-center space-x-2">
                              <button onClick={() => {setLoginFormState(acc); setIsEditingLogin(true); setLoginView('form');}} className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"><Edit size={16} /></button>
                              {acc.role !== 'admin' && <button onClick={() => handleDeleteLogin(acc.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <form onSubmit={handleSaveLogin} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">{isEditingLogin ? 'Edit Akun Login' : 'Buat Akun Baru'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" required value={loginFormState.username} onChange={e => setLoginFormState({...loginFormState, username: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="Username (huruf kecil tanpa spasi)" />
                    <input type="text" required value={loginFormState.password} onChange={e => setLoginFormState({...loginFormState, password: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="Password" />
                  </div>
                  <select required value={loginFormState.role} onChange={e => setLoginFormState({...loginFormState, role: e.target.value, teacherId: e.target.value === 'admin' ? '' : loginFormState.teacherId})} className="w-full p-2.5 border rounded-lg outline-none" disabled={loginFormState.role === 'admin' && isEditingLogin}>
                    <option value="guru">Guru Mata Pelajaran</option><option value="wali kelas">Wali Kelas</option><option value="admin">Admin System</option>
                  </select>
                  {loginFormState.role !== 'admin' && (
                    <select required value={loginFormState.teacherId} onChange={e => setLoginFormState({...loginFormState, teacherId: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none">
                      <option value="">-- Pilih Profil Guru yang Dihubungkan --</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.level})</option>)}
                    </select>
                  )}
                  <div className="flex space-x-3 pt-4"><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">Simpan</button><button type="button" onClick={() => setLoginView('table')} className="bg-gray-200 px-5 py-2 rounded-lg">Batal</button></div>
                </form>
              )}
            </div>
          )}

          {currentActiveMenu === 'admin-konsep-rapor' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print:hidden">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="font-bold text-xl flex items-center"><FileText className="mr-2 text-blue-600"/> Pengaturan & Desain Rapor (Word Mini)</h3>
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                  <button onClick={() => { setRaporViewMode('settings'); }} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${raporViewMode === 'settings' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}><Settings size={14} className="inline mr-1"/> 1. Data Rapor</button>
                  <button onClick={() => { setRaporViewMode('editor'); }} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${raporViewMode === 'editor' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}><PenTool size={14} className="inline mr-1"/> 2. Editor Template</button>
                  <button onClick={() => { setRaporViewMode('preview'); }} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${raporViewMode === 'preview' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}><Eye size={14} className="inline mr-1"/> 3. Pratinjau</button>
                </div>
              </div>

              {renderTabs(raporTab, setRaporTab)}

              {raporViewMode === 'settings' && (
                <form onSubmit={handleSaveRaporSettings} className="space-y-4 max-w-4xl bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Tahun Ajaran</label>
                      <input type="text" value={raporSettings[raporTab].tahunAjaran} onChange={e => setRaporSettings({...raporSettings, [raporTab]: {...raporSettings[raporTab], tahunAjaran: e.target.value}})} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="e.g., 2025/2026" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Semester</label>
                      <select value={raporSettings[raporTab].semester} onChange={e => setRaporSettings({...raporSettings, [raporTab]: {...raporSettings[raporTab], semester: e.target.value}})} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="Ganjil">Ganjil</option><option value="Genap">Genap</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Tempat Cetak</label>
                      <input type="text" value={raporSettings[raporTab].tempatCetak} onChange={e => setRaporSettings({...raporSettings, [raporTab]: {...raporSettings[raporTab], tempatCetak: e.target.value}})} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="e.g., Pangkep" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Tanggal Cetak</label>
                      <input type="date" value={raporSettings[raporTab].tanggalCetak} onChange={e => setRaporSettings({...raporSettings, [raporTab]: {...raporSettings[raporTab], tanggalCetak: e.target.value}})} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider text-blue-700">Font Global Rapor</label>
                      <select value={raporSettings[raporTab].fontFamily || 'Arial, sans-serif'} onChange={e => setRaporSettings({...raporSettings, [raporTab]: {...raporSettings[raporTab], fontFamily: e.target.value}})} className="w-full p-2 text-sm border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 font-bold">
                        <option value="Arial, Helvetica, sans-serif">Arial</option>
                        <option value="'Times New Roman', Times, serif">Times New Roman</option>
                        <option value="'Arial Narrow', 'PT Sans Narrow', sans-serif">Arial Narrow / PT Sans</option>
                        <option value="Calibri, sans-serif">Calibri</option>
                        <option value="'Courier New', Courier, monospace">Courier New</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Nama Kepala Sekolah</label>
                      <input type="text" value={raporSettings[raporTab].kepalaSekolah} onChange={e => setRaporSettings({...raporSettings, [raporTab]: {...raporSettings[raporTab], kepalaSekolah: e.target.value}})} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Nama Lengkap & Gelar" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">NIP Kepala Sekolah</label>
                      <input type="text" value={raporSettings[raporTab].nipKepalaSekolah} onChange={e => setRaporSettings({...raporSettings, [raporTab]: {...raporSettings[raporTab], nipKepalaSekolah: e.target.value}})} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="NIP (Opsional)" />
                    </div>
                  </div>
                  <div className="pt-3 mt-2 border-t border-gray-200 flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-5 py-2 text-sm rounded-lg flex items-center font-bold hover:bg-blue-700 transition-colors"><Save size={16} className="mr-2" /> Simpan Pengaturan</button>
                  </div>
                </form>
              )}

              {raporViewMode === 'editor' && (
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-64 bg-blue-50 p-4 rounded-xl border border-blue-100 flex-shrink-0 h-fit">
                    <h4 className="font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2 text-sm">Variabel Tersedia</h4>
                    <p className="text-[10px] text-blue-600 mb-2">Klik teks di bawah untuk menyalin. Anda bisa mem-paste tabel langsung dari MS Word ke kotak putih di samping.</p>
                    <p className="text-[10px] font-bold text-orange-600 bg-orange-100 p-1 rounded mb-3">TIPS: Gunakan modifier |U (Upper), |L (Lower), atau |P (Proper). Contoh: {"{{NAMA_SISWA|P}}"}</p>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 mb-1">DATA IDENTITAS</p>
                        {['{{NAMA_SISWA}}', '{{NISN}}', '{{NIS}}', '{{KELAS}}', '{{FASE}}', '{{TINGKAT}}', '{{NAMA_SEKOLAH}}', '{{ALAMAT_SEKOLAH}}', '{{TAHUN_AJARAN}}', '{{SEMESTER}}'].map(v => (
                          <button key={v} onClick={() => handleCopyVariable(v)} className="block w-full text-left px-2 py-1.5 text-[11px] font-mono bg-white border border-blue-200 rounded mb-1 hover:bg-blue-100">{v}</button>
                        ))}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 mb-1">TABEL & DATA DINAMIS</p>
                        {['{{TABEL_NILAI}}', '{{TABEL_HAFALAN}}', '{{TABEL_ABSENSI}}', '{{KARAKTER}}', '{{CATATAN_WALAS}}'].map(v => (
                          <button key={v} onClick={() => handleCopyVariable(v)} className="block w-full text-left px-2 py-1.5 text-[11px] font-mono bg-white border border-green-200 text-green-700 rounded mb-1 hover:bg-green-100">{v}</button>
                        ))}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 mb-1">TANDA TANGAN</p>
                        {['{{NAMA_KEPSEK}}', '{{NIP_KEPSEK}}', '{{NAMA_WALAS}}', '{{NIP_WALAS}}', '{{TEMPAT_CETAK}}', '{{TANGGAL_CETAK}}'].map(v => (
                          <button key={v} onClick={() => handleCopyVariable(v)} className="block w-full text-left px-2 py-1.5 text-[11px] font-mono bg-white border border-purple-200 text-purple-700 rounded mb-1 hover:bg-purple-100">{v}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ fontFamily: raporSettings[raporTab]?.fontFamily || 'Arial, sans-serif' }} className="flex-1 flex flex-col">
                    <RichTextEditor 
                       key={raporTab} 
                       initialValue={raporSettings[raporTab].templateHtml} 
                       onBlur={(newHtml) => {
                          const updated = { ...raporSettings, [raporTab]: { ...raporSettings[raporTab], templateHtml: newHtml } };
                          setRaporSettings(updated);
                          try { setDoc(docPath('raporSettings', raporTab), updated[raporTab]); showNotification("Template tersimpan otomatis ke Cloud."); } catch(e){}
                       }} 
                    />
                  </div>
                </div>
              )}

              {raporViewMode === 'preview' && (
                <div className="bg-gray-200 p-6 rounded-xl flex flex-col items-center overflow-x-auto relative">
                  <div className="bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded-lg font-medium mb-4 flex items-center shadow-sm w-full max-w-4xl">
                    <Eye size={16} className="mr-2" />
                    Pratinjau di-generate dari Template Word Mini. Menampilkan Siswa Pertama di jenjang ini. (Format kertas A4/F4 akan diterapkan saat mode cetak)
                  </div>
                  <div 
                    className="bg-white border border-gray-300 shadow-2xl origin-top transform scale-90 md:scale-100 text-black mx-auto relative overflow-visible print:overflow-visible print:shadow-none print:border-none"
                    style={{ width: printConfig.paperSize === 'A4' ? '210mm' : '215mm', minHeight: printConfig.paperSize === 'A4' ? '297mm' : '330mm', padding: `${printConfig.marginTop}mm ${printConfig.marginRight}mm ${printConfig.marginBottom}mm ${printConfig.marginLeft}mm`, fontFamily: raporSettings[raporTab]?.fontFamily || 'Arial, sans-serif', fontSize: '11pt', boxSizing: 'border-box' }}
                    dangerouslySetInnerHTML={{ __html: getPreviewTemplateHTML() }}
                  />
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              KONTEN SHARED (ADMIN & GURU)
              ========================================================= */}
          
          {(currentActiveMenu === 'admin-cp' || currentActiveMenu === 'guru-cp') && (() => {
            const isAdmin = currentUser?.role === 'admin';
            const isWali = currentUser?.role === 'wali kelas';
            let allowedSubjects = subjects;
            if (!isAdmin && !isWali) allowedSubjects = subjects.filter(s => s.teacherId === currentUser?.teacherId);

            return (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl flex items-center"><ListChecks className="mr-2 text-blue-600"/> Bank Capaian Kompetensi (CP)</h3>
                  {cpView === 'table' && <button onClick={() => { setCpFormState({ id: '', subjectId: allowedSubjects[0]?.id || '', classId: '', tahunAjaran: activeTA, semester: activeSemester, fase: 'A', deskripsi: '' }); setIsEditingCp(false); setCpView('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><PlusCircle size={18} className="mr-2" /> Tambah CP</button>}
                </div>

                {cpView === 'table' ? (
                  <>
                    <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-4 items-center">
                       {isAdmin && (
                         <div className="mr-4">
                           <span className="font-semibold text-blue-800 mr-2">Jenjang:</span>
                           {renderTabs(cpTab, (t) => { setCpTab(t); setSelectedCpSubject(''); })}
                         </div>
                       )}
                       <label className="font-semibold text-blue-800 whitespace-nowrap">Filter Mapel:</label>
                       <select className="p-2 border border-blue-200 rounded-lg outline-none w-full max-w-sm bg-white" value={selectedCpSubject} onChange={(e) => setSelectedCpSubject(e.target.value)}>
                          <option value="">Semua Mapel Saya</option>
                          {allowedSubjects.filter(s => isAdmin ? s.level === cpTab : true).map(sub => <option key={sub.id} value={sub.id}>{sub.name} ({sub.level})</option>)}
                       </select>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-gray-100 text-gray-700 text-sm"><th className="p-3 border-b font-semibold w-12 text-center">No</th><th className="p-3 border-b font-semibold w-24 text-center">T.A & Sem</th><th className="p-3 border-b font-semibold w-16 text-center">Fase</th><th className="p-3 border-b font-semibold w-20 text-center">Kelas</th><th className="p-3 border-b font-semibold w-48">Mata Pelajaran</th><th className="p-3 border-b font-semibold">Deskripsi Capaian Kompetensi (CP)</th><th className="p-3 border-b font-semibold text-center w-24">Aksi</th></tr></thead>
                        <tbody>
                          {cps.filter(c => {
                             const sub = subjects.find(s => s.id === c.subjectId);
                             const isLevelMatch = isAdmin ? sub?.level === cpTab : true;
                             const isSubMatch = selectedCpSubject ? c.subjectId === selectedCpSubject : allowedSubjects.some(s => s.id === c.subjectId);
                             return isLevelMatch && isSubMatch;
                          }).length === 0 ? (
                             <tr><td colSpan="7" className="p-8 text-center text-gray-500">Belum ada data Capaian Kompetensi di jenjang/mapel ini.</td></tr>
                          ) : (
                            cps.filter(c => {
                               const sub = subjects.find(s => s.id === c.subjectId);
                               const isLevelMatch = isAdmin ? sub?.level === cpTab : true;
                               const isSubMatch = selectedCpSubject ? c.subjectId === selectedCpSubject : allowedSubjects.some(s => s.id === c.subjectId);
                               return isLevelMatch && isSubMatch;
                            }).map((cp, idx) => {
                              const sub = subjects.find(s => s.id === cp.subjectId) || { name: 'Mapel Dihapus' };
                              return (
                                <tr key={cp.id} className="border-b hover:bg-gray-50 text-sm">
                                  <td className="p-3 text-center align-top">{idx + 1}</td>
                                  <td className="p-3 text-center text-xs align-top text-gray-500">{cp.tahunAjaran}<br/>{cp.semester}</td>
                                  <td className="p-3 text-center font-bold text-blue-600 align-top">{cp.fase}</td>
                                  <td className="p-3 text-center font-bold text-gray-700 align-top">{classes.find(c => c.id === cp.classId)?.name || '-'}</td>
                                  <td className="p-3 align-top font-medium">{sub.name}</td>
                                  <td className="p-3 align-top text-justify leading-relaxed">{cp.deskripsi}</td>
                                  <td className="p-3 flex justify-center space-x-2 align-top">
                                    <button onClick={() => {setCpFormState(cp); setIsEditingCp(true); setCpView('form');}} className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteCp(cp.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (() => {
                  const allowedClassesForCp = isAdmin ? classes.filter(c => c.level === cpTab) : classes;

                  return (
                    <form onSubmit={handleSaveCp} className="space-y-4 max-w-3xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">{isEditingCp ? 'Edit CP' : `Tambah CP Baru`}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                         <select required value={cpFormState.classId} onChange={e => {
                            const cId = e.target.value;
                            const cls = classes.find(c => c.id === cId);
                            const fs = cls ? getFase(cls.tingkat) : '';
                            setCpFormState({...cpFormState, classId: cId, fase: fs, subjectId: ''});
                         }} className="w-full p-2.5 border rounded-lg outline-none">
                            <option value="">-- 1. Pilih Kelas --</option>
                            {allowedClassesForCp.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                         </select>

                         <select required value={cpFormState.subjectId} onChange={e => {
                            const subId = e.target.value;
                            setCpFormState({...cpFormState, subjectId: subId});
                         }} className="w-full p-2.5 border rounded-lg outline-none" disabled={!cpFormState.classId}>
                            <option value="">-- 2. Pilih Mata Pelajaran --</option>
                            {allowedSubjects.filter(s => s.level === classes.find(c => c.id === cpFormState.classId)?.level).map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                         </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                         <input type="text" disabled value={cpFormState.tahunAjaran} className="w-full p-2.5 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed text-center font-bold" />
                         <input type="text" disabled value={cpFormState.semester} className="w-full p-2.5 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed text-center font-bold" />
                         <input type="text" disabled value={cpFormState.fase ? `Fase ${cpFormState.fase}` : 'Pilih Kelas Dulu'} className="w-full p-2.5 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed text-center font-bold" />
                      </div>
                      <textarea required value={cpFormState.deskripsi} onChange={e => setCpFormState({...cpFormState, deskripsi: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none min-h-[100px]" placeholder="Ketik kalimat Capaian Kompetensi (CP)..." />
                      
                      <div className="flex space-x-3 pt-4"><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">Simpan CP</button><button type="button" onClick={() => setCpView('table')} className="bg-gray-200 px-5 py-2 rounded-lg">Batal</button></div>
                    </form>
                  );
                })()}
              </div>
            );
          })()}

          {(currentActiveMenu === 'admin-nilai' || currentActiveMenu === 'admin-nilai-mapel' || currentActiveMenu === 'guru-nilai-mapel' || currentActiveMenu === 'guru-rekap-nilai') && (() => {
            const isAdmin = currentUser?.role === 'admin';
            const isGuruMapel = currentActiveMenu === 'guru-nilai-mapel';
            const isWaliRekap = currentActiveMenu === 'guru-rekap-nilai'; 
            
            let allowedClasses = [];
            if (isAdmin) {
               allowedClasses = classes.filter(c => c.level === rekapTab);
            } else if (isGuruMapel) {
               const mySubjects = subjects.filter(s => s.teacherId === currentUser.teacherId);
               const myLevels = [...new Set(mySubjects.map(s => s.level))];
               allowedClasses = classes.filter(c => myLevels.includes(c.level));
            } else if (isWaliRekap) {
               allowedClasses = classes.filter(c => c.id === activeClass?.id);
            }

            const displayClassId = isAdmin ? selectedClassId : (isWaliRekap ? activeClass?.id : selectedClassId);
            const displayClass = classes.find(c => c.id === displayClassId);

            let classSubjects = [];
            if (displayClass) classSubjects = subjects.filter(s => s.level === displayClass.level).sort((a,b) => (a.urutan || 0) - (b.urutan || 0));
            
            let allowedSubjects = [];
            if (isAdmin || isWaliRekap) allowedSubjects = classSubjects;
            else if (isGuruMapel) allowedSubjects = classSubjects.filter(s => s.teacherId === currentUser.teacherId);

            const currentSubjectId = (activeSubjectId && allowedSubjects.some(s => s.id === activeSubjectId)) 
              ? activeSubjectId 
              : (allowedSubjects.length > 0 ? allowedSubjects[0].id : null);
              
            const myEnrs = displayClass ? activeEnrollments.filter(e => e.classId === displayClass.id) : [];
            const classFase = displayClass ? getFase(displayClass.tingkat) : 'A';
            const availableCps = cps.filter(c => c.subjectId === currentSubjectId && c.classId === displayClass?.id && c.tahunAjaran === activeTA && c.semester === activeSemester);

            return (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl flex items-center"><FileSpreadsheet className="mr-2 text-blue-600"/> {(isAdmin || isWaliRekap) ? 'Rekap Nilai Siswa' : 'Input Nilai Mata Pelajaran'}</h3>
                  <div className="flex space-x-2">
                    {displayClass && currentSubjectId && (
                      !isFinalViewMode ? (
                        <>
                          <button onClick={() => setShowImportNilaiModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold hover:bg-green-700 shadow-md">
                            <FileUp size={18} className="mr-2" /> Import Excel
                          </button>
                          <button onClick={() => handleCekNilaiAkhir(displayClass, currentSubjectId)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold hover:bg-indigo-700 shadow-md">
                            <Eye size={18} className="mr-2" /> Cek Nilai Akhir
                          </button>
                          <button onClick={() => handleSaveBulkEnrollments(displayClass.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold hover:bg-blue-700 shadow-md">
                            <Save size={18} className="mr-2" /> Simpan
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setIsFinalViewMode(false)} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold hover:bg-gray-700 shadow-md">
                          <Edit size={18} className="mr-2" /> Kembali Edit
                        </button>
                      )
                    )}
                  </div>
                </div>

                {showImportNilaiModal && (
                   <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                     <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                       <div className="bg-green-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold text-lg flex items-center"><FileUp className="mr-2"/> Import Nilai & CP - {displayClass?.name}</h3><button onClick={() => setShowImportNilaiModal(false)}>X</button></div>
                       <div className="p-6 flex-1 overflow-y-auto">
                          <p className="text-sm text-gray-600 mb-4">Silakan <b>Copy (Salin)</b> data dari Microsoft Excel lalu <b>Paste (Tempel)</b> ke dalam kotak di bawah ini.</p>
                          <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-lg mb-4 text-sm text-yellow-800">
                            <p className="font-bold mb-1">PENTING! Format urutan 5 kolom Excel harus persis seperti ini:</p>
                            <p className="font-mono bg-white p-2 rounded border border-yellow-300">NISN | Sumatif 1 | Sumatif 2 | Teks Capaian TERCAPAI | Teks Capaian BELUM TERCAPAI</p>
                            <p className="mt-2 text-xs">Sistem akan memasukkan nilai tersebut berdasarkan ketepatan <b>NISN</b> siswa.</p>
                          </div>
                          <textarea 
                             className="w-full h-64 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm whitespace-pre"
                             placeholder="0123456789&#9;85&#9;90&#9;Mencapai kompetensi dalam hal...&#9;Perlu bimbingan dalam hal..."
                             value={importNilaiText}
                             onChange={e => setImportNilaiText(e.target.value)}
                          ></textarea>
                       </div>
                       <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                          <button onClick={() => setShowImportNilaiModal(false)} className="px-5 py-2 rounded-lg bg-gray-200 font-bold text-gray-700">Batal</button>
                          <button onClick={() => handleImportNilaiSubmit(displayClass.id, currentSubjectId)} className="px-5 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700">Proses Import</button>
                       </div>
                     </div>
                   </div>
                )}
                
                {isAdmin && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-sm font-semibold text-blue-800 mb-2">1. Pilih Jenjang:</label>
                    {renderTabs(rekapTab, (tab) => { setRekapTab(tab); setSelectedClassId(''); setActiveSubjectId(null); setIsFinalViewMode(false); })}
                  </div>
                )}

                {(isAdmin || isGuruMapel) && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-1">Pilih Kelas:</label>
                      <select className="w-full p-2.5 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={selectedClassId || ''} onChange={(e) => { setSelectedClassId(e.target.value); setActiveSubjectId(null); setIsFinalViewMode(false); }}>
                        <option value="">-- Pilih Kelas --</option>
                        {allowedClasses.map(c => <option key={c.id} value={c.id}>{c.name} (Jenjang {c.level})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-1">Pilih Mata Pelajaran:</label>
                      <select className="w-full p-2.5 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={currentSubjectId || ''} onChange={(e) => { setActiveSubjectId(e.target.value); setIsFinalViewMode(false); }} disabled={!displayClass}>
                        <option value="">-- Pilih Mata Pelajaran --</option>
                        {allowedSubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {isWaliRekap && displayClass && allowedSubjects.length > 0 && (
                   <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <label className="block text-sm font-semibold text-blue-800 mb-1">Pilih Mata Pelajaran untuk Direkap:</label>
                     <select className="w-full max-w-sm p-2.5 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={currentSubjectId || ''} onChange={(e) => { setActiveSubjectId(e.target.value); setIsFinalViewMode(false); }}>
                        {allowedSubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                     </select>
                   </div>
                )}

                {displayClass && currentSubjectId && !isFinalViewMode && (
                  <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-gray-700">Metode Input CP:</span>
                      <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={cpInputMode === 'manual'} onChange={() => setCpInputMode('manual')} className="w-4 h-4 text-blue-600" /><span className="font-medium text-sm">Input Manual</span></label>
                      <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={cpInputMode === 'otomatis'} onChange={() => setCpInputMode('otomatis')} className="w-4 h-4 text-blue-600" /><span className="font-medium text-sm">Pilih CP (Otomatis)</span></label>
                    </div>
                    <button onClick={() => setShowPredikatModal(true)} className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-bold text-sm flex items-center"><Settings2 size={16} className="mr-2"/> Atur Predikat Nilai</button>
                  </div>
                )}

                {showPredikatModal && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                      <div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold text-lg">Atur Predikat Nilai</h3><button onClick={() => setShowPredikatModal(false)}>X</button></div>
                      <div className="p-6 space-y-4">
                         {predikats.map(p => (
                           <div key={p.id} className="flex items-center space-x-2 border-b pb-2">
                             <input type="number" className="w-16 p-2 border rounded text-center" value={p.min} onChange={e => setPredikats(predikats.map(pr => pr.id === p.id ? {...pr, min: parseInt(e.target.value)} : pr))} />
                             <span className="font-bold text-gray-400">-</span>
                             <input type="number" className="w-16 p-2 border rounded text-center" value={p.max} onChange={e => setPredikats(predikats.map(pr => pr.id === p.id ? {...pr, max: parseInt(e.target.value)} : pr))} />
                             <input type="text" className="flex-1 p-2 border rounded font-bold text-blue-700" value={p.label} onChange={e => setPredikats(predikats.map(pr => pr.id === p.id ? {...pr, label: e.target.value} : pr))} placeholder="Predikat" />
                           </div>
                         ))}
                         <button onClick={() => setShowPredikatModal(false)} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg mt-4">Simpan Konfigurasi</button>
                      </div>
                    </div>
                  </div>
                )}

                {!displayClass || !currentSubjectId ? (
                  <div className="text-center py-12 text-gray-500 border-t border-dashed mt-4 pt-8"><FileSpreadsheet size={48} className="mx-auto text-gray-300 mb-4" /><p>Pilih parameter kelas & mapel terlebih dahulu.</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    {cpInputMode === 'otomatis' && availableCps.length === 0 && !isFinalViewMode && (
                      <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-xl mb-4 text-sm font-medium">Perhatian: Belum ada Capaian Kompetensi (CP) untuk mapel ini di Kelas ini. Silakan tambahkan terlebih dahulu melalui menu Bank CP.</div>
                    )}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-300">
                          <th rowSpan="2" className="p-3 border-r border-gray-200 font-semibold w-12 text-center align-middle">No</th>
                          <th rowSpan="2" className="p-3 border-r border-gray-200 font-semibold align-middle min-w-[150px]">Nama Siswa</th>
                          {!isFinalViewMode && <th rowSpan="2" className="p-3 border-r border-gray-200 font-semibold text-center align-middle w-12">JK</th>}
                          <th colSpan="2" className="p-2 border-b border-r border-gray-200 font-semibold text-center">Sumatif Lingkup Materi</th>
                          <th rowSpan="2" className="p-3 border-r border-gray-200 font-semibold text-center align-middle w-20">Nilai Akhir</th>
                          <th colSpan="2" className="p-2 border-b border-gray-200 font-semibold text-center">
                            {isFinalViewMode ? 'Capaian Kompetensi' : (cpInputMode === 'manual' ? 'Capaian Kompetensi' : 'Pilih Capaian Kompetensi (Otomatis)')}
                          </th>
                        </tr>
                        <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-300">
                          <th className="p-2 border-r border-gray-200 font-semibold text-center w-20">Sumatif 1</th><th className="p-2 border-r border-gray-200 font-semibold text-center w-20">Sumatif 2</th>
                          <th className="p-2 border-r border-gray-200 font-semibold text-center min-w-[250px]">{isFinalViewMode ? 'Tercapai' : 'Tercapai'}</th>
                          <th className="p-2 border-gray-200 font-semibold text-center min-w-[250px]">{isFinalViewMode ? 'Belum Tercapai' : 'Belum Tercapai'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myEnrs.length === 0 ? (
                          <tr><td colSpan="8" className="p-8 text-center text-gray-500">Belum ada siswa di kelas ini pada periode berjalan.</td></tr>
                        ) : (
                          myEnrs.map((enr, idx) => {
                            const std = students.find(s => s.id === enr.studentId) || { name: '-', jk: '-' };
                            const stdNilai = enr.nilai?.[currentSubjectId] || { sumatif1: '', sumatif2: '', tercapai: '', belumTercapai: '', selectedCps: {} };
                            const s1 = parseFloat(stdNilai.sumatif1) || ''; const s2 = parseFloat(stdNilai.sumatif2) || '';
                            let nilaiAkhir = '';
                            if (s1 !== '' || s2 !== '') {
                              const avg = (Number(s1) + Number(s2)) / ( (s1 !== '' && s2 !== '') ? 2 : 1 );
                              nilaiAkhir = Math.round(avg).toString();
                            }

                            if (isFinalViewMode) {
                              return (
                                <tr key={enr.id} className="border-b hover:bg-gray-50 text-sm">
                                  <td className="p-3 text-center border-r border-gray-100 align-top">{idx + 1}</td>
                                  <td className="p-3 font-medium text-gray-800 border-r border-gray-100 align-top">{std.name}</td>
                                  <td className="p-3 text-center border-r border-gray-100 align-top font-medium">{s1 || '-'}</td>
                                  <td className="p-3 text-center border-r border-gray-100 align-top font-medium">{s2 || '-'}</td>
                                  <td className="p-3 text-center border-r border-gray-100 font-bold text-blue-600 bg-blue-50/30 align-top">{nilaiAkhir || '-'}</td>
                                  <td className="p-3 text-justify border-r border-gray-100 align-top text-xs leading-relaxed whitespace-pre-wrap">{stdNilai.tercapai || '-'}</td>
                                  <td className="p-3 text-justify align-top text-xs leading-relaxed whitespace-pre-wrap">{stdNilai.belumTercapai || '-'}</td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={enr.id} className="border-b hover:bg-gray-50 text-sm">
                                <td className="p-3 text-center border-r border-gray-100 align-top">{idx + 1}</td>
                                <td className="p-3 font-medium text-gray-800 border-r border-gray-100 align-top">{std.name}</td>
                                <td className="p-3 text-center border-r border-gray-100 align-top">{std.jk}</td>
                                <td className="p-2 text-center border-r border-gray-100 align-top"><input type="number" min="0" max="100" className="w-full p-2 text-center border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={stdNilai.sumatif1} onChange={(e) => handleGradeChange(enr.id, currentSubjectId, 'sumatif1', e.target.value)} placeholder="0" /></td>
                                <td className="p-2 text-center border-r border-gray-100 align-top"><input type="number" min="0" max="100" className="w-full p-2 text-center border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={stdNilai.sumatif2} onChange={(e) => handleGradeChange(enr.id, currentSubjectId, 'sumatif2', e.target.value)} placeholder="0" /></td>
                                <td className="p-3 text-center border-r border-gray-100 font-bold text-blue-600 bg-blue-50/30 align-top">{nilaiAkhir}</td>
                                
                                {cpInputMode === 'manual' ? (
                                  <>
                                    <td className="p-2 text-center border-r border-gray-100 align-top"><textarea className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none overflow-hidden text-xs leading-relaxed bg-green-50/30" onInput={handleTextareaResize} value={stdNilai.tercapai} onChange={(e) => handleGradeChange(enr.id, currentSubjectId, 'tercapai', e.target.value)} placeholder="Ketik manual capaian..." /></td>
                                    <td className="p-2 text-center align-top"><textarea className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none overflow-hidden text-xs leading-relaxed bg-red-50/30" onInput={handleTextareaResize} value={stdNilai.belumTercapai} onChange={(e) => handleGradeChange(enr.id, currentSubjectId, 'belumTercapai', e.target.value)} placeholder="Ketik manual capaian..." /></td>
                                  </>
                                ) : (
                                  <>
                                    <td className="p-2 border-r border-gray-100 align-top bg-green-50/10">
                                      {availableCps.map(cp => (
                                        <label key={cp.id} className="flex items-start space-x-2 mb-2 text-xs text-gray-700 cursor-pointer hover:bg-white p-1 rounded transition-colors"><input type="checkbox" className="mt-0.5 text-green-600 focus:ring-green-500" checked={stdNilai.selectedCps?.[cp.id] === 'tercapai'} onChange={() => handleSelectCpCheckbox(enr.id, currentSubjectId, cp.id, 'tercapai')} /><span className="leading-tight text-justify">{cp.deskripsi}</span></label>
                                      ))}
                                    </td>
                                    <td className="p-2 align-top bg-red-50/10">
                                      {availableCps.map(cp => (
                                        <label key={cp.id} className="flex items-start space-x-2 mb-2 text-xs text-gray-700 cursor-pointer hover:bg-white p-1 rounded transition-colors"><input type="checkbox" className="mt-0.5 text-red-600 focus:ring-red-500" checked={stdNilai.selectedCps?.[cp.id] === 'belumTercapai'} onChange={() => handleSelectCpCheckbox(enr.id, currentSubjectId, cp.id, 'belumTercapai')} /><span className="leading-tight text-justify">{cp.deskripsi}</span></label>
                                      ))}
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {(currentActiveMenu === 'admin-nilai-hafalan' || currentActiveMenu === 'guru-nilai-hafalan' || currentActiveMenu === 'guru-rekap-hafalan') && (() => {
            const isAdmin = currentUser?.role === 'admin';
            const isWaliRekap = currentActiveMenu === 'guru-rekap-hafalan'; 
            
            const displayClassId = isAdmin ? selectedClassId : activeClass?.id;
            const displayClass = classes.find(c => c.id === displayClassId);
            const myEnrs = displayClassId ? activeEnrollments.filter(e => e.classId === displayClassId) : [];

            return (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl flex items-center"><BookOpen className="mr-2 text-purple-600"/> Input Hafalan & Tilawah {displayClass ? `- ${displayClass.name}` : ''}</h3>
                  {displayClass && <button onClick={() => handleSaveBulkEnrollments(displayClass.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-purple-700"><Save size={18} className="mr-2" /> Simpan Data</button>}
                </div>

                {isAdmin && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div>
                      <label className="block text-sm font-semibold text-purple-800 mb-1">Pilih Jenjang:</label>
                      {renderTabs(rekapTab, (tab) => { setRekapTab(tab); setSelectedClassId(''); })}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-purple-800 mb-1">Pilih Kelas:</label>
                      <select className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={selectedClassId || ''} onChange={(e) => setSelectedClassId(e.target.value)}>
                        <option value="">-- Pilih Kelas --</option>
                        {classes.filter(c => c.level === rekapTab).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {!displayClass ? (
                  <div className="text-center py-12 text-gray-500"><BookOpen size={48} className="mx-auto text-gray-300 mb-4" /><p>Silakan pilih parameter kelas terlebih dahulu.</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-300">
                          <th className="p-3 border-r border-gray-200 font-semibold w-12 text-center">No</th>
                          <th className="p-3 border-r border-gray-200 font-semibold min-w-[150px]">Nama Siswa</th>
                          <th className="p-3 border-r border-gray-200 font-semibold text-center w-12">JK</th>
                          <th className="p-3 border-r border-gray-200 font-semibold w-24">NISN</th>
                          <th className="p-3 border-r border-gray-200 font-semibold min-w-[180px]">Surah</th>
                          <th className="p-3 border-r border-gray-200 font-semibold min-w-[180px]">Hadist</th>
                          <th className="p-3 border-r border-gray-200 font-semibold min-w-[180px]">Doa</th>
                          <th className="p-3 font-semibold min-w-[180px]">Tilawah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myEnrs.length === 0 ? (<tr><td colSpan="8" className="p-8 text-center text-gray-500">Belum ada siswa di kelas ini.</td></tr>) : (
                          myEnrs.map((enr, idx) => {
                            const std = students.find(s => s.id === enr.studentId) || { name: '-', jk: '-', nisn: '-' };
                            const spData = enr.specialData || { surah: [''], hadist: [''], doa: [''], tilawah: [''] };
                            
                            const renderList = (category, placeholder) => (
                              <td className="p-2 border-r border-gray-100 align-top">
                                {spData[category].map((val, i) => (
                                   <div key={i} className="flex items-center mb-1.5"><input type="text" className="w-full p-1.5 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500 text-xs" value={val} onChange={(e) => handleSpecialDataChange(enr.id, category, i, e.target.value)} placeholder={placeholder} /><button onClick={() => handleRemoveSpecialData(enr.id, category, i)} className="ml-1.5 text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div>
                                ))}
                                <button onClick={() => handleAddSpecialData(enr.id, category)} className="text-xs font-semibold text-blue-600 flex items-center mt-1"><PlusCircle size={12} className="mr-1"/> Tambah</button>
                              </td>
                            );

                            return (
                              <tr key={enr.id} className="border-b hover:bg-gray-50 text-sm">
                                <td className="p-3 text-center border-r border-gray-100 align-top">{idx + 1}</td><td className="p-3 font-medium text-gray-800 border-r border-gray-100 align-top">{std.name}</td><td className="p-3 text-center border-r border-gray-100 align-top">{std.jk}</td><td className="p-3 text-gray-600 border-r border-gray-100 align-top">{std.nisn}</td>
                                {renderList('surah', 'Nama Surah')}{renderList('hadist', 'Nama Hadist')}{renderList('doa', 'Nama Doa')}{renderList('tilawah', 'Jilid/Hal/Surah')}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {currentActiveMenu === 'guru-kehadiran' && (() => {
            const myEnrs = activeEnrollments.filter(e => e.classId === activeClass?.id);
            return (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl flex items-center"><Users className="mr-2 text-blue-600"/> Kehadiran Siswa {activeClass ? `- ${activeClass.name}` : ''}</h3>
                  {activeClass && <button onClick={() => handleSaveBulkEnrollments(activeClass.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><Save size={18} className="mr-2" /> Simpan</button>}
                </div>
                {!activeClass ? (
                  <div className="text-center py-12 text-gray-500"><Users size={48} className="mx-auto text-gray-300 mb-4" /><p>Anda tidak terdaftar sebagai wali kelas.</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-300">
                          <th rowSpan="2" className="p-3 border-r border-gray-200 font-semibold w-12 text-center align-middle">No</th><th rowSpan="2" className="p-3 border-r border-gray-200 font-semibold align-middle">Nama Siswa</th><th rowSpan="2" className="p-3 border-r border-gray-200 font-semibold text-center align-middle">JK</th><th rowSpan="2" className="p-3 border-r border-gray-200 font-semibold align-middle">NIS</th><th colSpan="3" className="p-2 border-b border-gray-200 font-semibold text-center">Kehadiran (Hari)</th>
                        </tr>
                        <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-300"><th className="p-2 border-r border-gray-200 font-semibold text-center w-24">Sakit</th><th className="p-2 border-r border-gray-200 font-semibold text-center w-24">Izin</th><th className="p-2 font-semibold text-center w-24">Tanpa Ket.</th></tr>
                      </thead>
                      <tbody>
                        {myEnrs.length === 0 ? (
                          <tr><td colSpan="7" className="p-8 text-center text-gray-500">Belum ada siswa di kelas ini.</td></tr>
                        ) : (
                          myEnrs.map((enr, idx) => {
                            const std = students.find(s => s.id === enr.studentId) || { name: '-', jk: '-', nis: '-' };
                            return (
                              <tr key={enr.id} className="border-b hover:bg-gray-50 text-sm">
                                <td className="p-3 text-center border-r border-gray-100">{idx + 1}</td><td className="p-3 font-medium text-gray-800 border-r border-gray-100">{std.name}</td><td className="p-3 text-center border-r border-gray-100">{std.jk}</td><td className="p-3 text-gray-600 border-r border-gray-100">{std.nis}</td>
                                <td className="p-2 text-center border-r border-gray-100"><input type="number" min="0" className="w-16 p-1.5 text-center border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={enr.kehadiran?.sakit || ''} onChange={(e) => handleAttendanceChange(enr.id, 'sakit', e.target.value)} /></td>
                                <td className="p-2 text-center border-r border-gray-100"><input type="number" min="0" className="w-16 p-1.5 text-center border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={enr.kehadiran?.izin || ''} onChange={(e) => handleAttendanceChange(enr.id, 'izin', e.target.value)} /></td>
                                <td className="p-2 text-center"><input type="number" min="0" className="w-16 p-1.5 text-center border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={enr.kehadiran?.alpa || ''} onChange={(e) => handleAttendanceChange(enr.id, 'alpa', e.target.value)} /></td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {currentActiveMenu === 'guru-catatan' && (() => {
            const myEnrs = activeEnrollments.filter(e => e.classId === activeClass?.id);
            return (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl flex items-center"><CheckSquare className="mr-2 text-blue-600"/> Karakter & Catatan Wali Kelas {activeClass ? `- ${activeClass.name}` : ''}</h3>
                  {activeClass && <button onClick={() => handleSaveBulkEnrollments(activeClass.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"><Save size={18} className="mr-2" /> Simpan Catatan</button>}
                </div>
                {!activeClass ? (
                  <div className="text-center py-12 text-gray-500"><CheckSquare size={48} className="mx-auto text-gray-300 mb-4" /><p>Anda tidak terdaftar sebagai wali kelas.</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-300"><th className="p-3 border-r border-gray-200 font-semibold w-12 text-center align-middle">No</th><th className="p-3 border-r border-gray-200 font-semibold align-middle">Nama Siswa</th><th className="p-3 border-r border-gray-200 font-semibold text-center align-middle">JK</th><th className="p-3 border-r border-gray-200 font-semibold align-middle min-w-[250px]">Karakter</th><th className="p-3 font-semibold align-middle min-w-[250px]">Catatan Wali Kelas</th></tr></thead>
                      <tbody>
                        {myEnrs.length === 0 ? (
                          <tr><td colSpan="5" className="p-8 text-center text-gray-500">Belum ada siswa yang dimasukkan ke kelas ini.</td></tr>
                        ) : (
                          myEnrs.map((enr, idx) => {
                            const std = students.find(s => s.id === enr.studentId) || { name: '-', jk: '-' };
                            return (
                              <tr key={enr.id} className="border-b hover:bg-gray-50 text-sm">
                                <td className="p-3 text-center border-r border-gray-100 align-top">{idx + 1}</td><td className="p-3 font-medium text-gray-800 border-r border-gray-100 align-top">{std.name}</td><td className="p-3 text-center border-r border-gray-100 align-top">{std.jk}</td>
                                <td className="p-2 border-r border-gray-100 align-top"><textarea className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[50px] resize-none overflow-hidden text-sm leading-relaxed bg-yellow-50/30" onInput={handleTextareaResize} value={enr.karakter || ''} onChange={(e) => handleCatatanChange(enr.id, 'karakter', e.target.value)} placeholder="Ketik deskripsi karakter siswa..." /></td>
                                <td className="p-2 align-top"><textarea className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[50px] resize-none overflow-hidden text-sm leading-relaxed bg-green-50/30" onInput={handleTextareaResize} value={enr.catatanWalas || ''} onChange={(e) => handleCatatanChange(enr.id, 'catatanWalas', e.target.value)} placeholder="Ketik pesan / evaluasi dari wali kelas..." /></td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {(currentActiveMenu === 'admin-cetak' || currentActiveMenu === 'guru-rapor') && (() => {
            const isAdmin = currentUser?.role === 'admin';
            const isWali = currentUser?.role === 'wali kelas';
            
            if (isWali && !activeClass) {
              return <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center py-16"><Printer size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Anda tidak terdaftar sebagai wali kelas.</p></div>;
            }

            const displayLevel = isAdmin ? raporTab : activeClass?.level;
            const displayClassId = isAdmin ? selectedClassId : activeClass?.id;
            
            return (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print:hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl flex items-center"><Printer className="mr-2 text-blue-600"/> Cetak Rapor Siswa {isWali && `- Kelas ${activeClass?.name}`}</h3>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
                  <h4 className="font-bold text-purple-800 mb-3 border-b border-purple-200 pb-2 text-sm flex items-center"><Settings size={16} className="mr-2"/> 1. Pengaturan Kertas & Margin Cetak</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Ukuran Kertas</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm" value={printConfig.paperSize} onChange={e => setPrintConfig({...printConfig, paperSize: e.target.value})}>
                        <option value="F4">F4 / Folio (215 x 330)</option><option value="A4">A4 (210 x 297)</option>
                      </select>
                    </div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Margin Atas (mm)</label><input type="number" value={printConfig.marginTop} onChange={e => setPrintConfig({...printConfig, marginTop: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg outline-none text-sm" /></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Margin Bawah (mm)</label><input type="number" value={printConfig.marginBottom} onChange={e => setPrintConfig({...printConfig, marginBottom: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg outline-none text-sm" /></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Margin Kiri (mm)</label><input type="number" value={printConfig.marginLeft} onChange={e => setPrintConfig({...printConfig, marginLeft: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg outline-none text-sm" /></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Margin Kanan (mm)</label><input type="number" value={printConfig.marginRight} onChange={e => setPrintConfig({...printConfig, marginRight: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg outline-none text-sm" /></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2 text-sm flex items-center"><Users size={16} className="mr-2"/> 2. Filter & Data Siswa</h4>
                  {isAdmin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Pilih Jenjang</label>{renderTabs(raporTab, (t) => {setRaporTab(t); setSelectedClassId('');})}</div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 mt-1 md:mt-0 uppercase tracking-wider">Pilih Kelas</label>
                        <select className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={selectedClassId || ''} onChange={(e) => setSelectedClassId(e.target.value)}>
                          <option value="">-- Tampilkan Semua Kelas di {raporTab} --</option>
                          {classes.filter(c => c.level === raporTab).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-600">Daftar Siswa Siap Cetak:</span>
                      <button 
                        onClick={() => {
                          const filtered = activeEnrollments.filter(e => {
                            const cls = classes.find(c => c.id === e.classId);
                            return cls?.level === displayLevel && (displayClassId ? e.classId === displayClassId : true);
                          });
                          if (filtered.length > 0) setPrintDataQueue(filtered.map(e => e.id));
                          else showNotification("Tidak ada siswa untuk dicetak pada kelas/jenjang ini!");
                        }} 
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold hover:bg-green-700 shadow-md"
                      >
                        <Printer size={16} className="mr-2" /> Cetak Semua Siswa Tampil
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-left border-collapse bg-white">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 text-sm">
                            <th className="p-3 border-b font-semibold w-12 text-center">No</th>
                            <th className="p-3 border-b font-semibold">Nama Siswa</th>
                            <th className="p-3 border-b font-semibold text-center w-16">JK</th>
                            <th className="p-3 border-b font-semibold">NISN</th>
                            <th className="p-3 border-b font-semibold">Kelas</th>
                            <th className="p-3 border-b font-semibold text-center w-28">Aksi Cetak</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeEnrollments.filter(e => {
                            const cls = classes.find(c => c.id === e.classId);
                            return cls?.level === displayLevel && (displayClassId ? e.classId === displayClassId : true);
                          }).length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Tidak ada data siswa yang cocok dengan filter.</td></tr>
                          ) : (
                            activeEnrollments.filter(e => {
                              const cls = classes.find(c => c.id === e.classId);
                              return cls?.level === displayLevel && (displayClassId ? e.classId === displayClassId : true);
                            }).map((enr, idx) => {
                              const std = students.find(s => s.id === enr.studentId) || { name: '-', jk: '-', nisn: '-' };
                              const stdClass = classes.find(c => c.id === enr.classId) || { name: '-' };
                              return (
                                <tr key={enr.id} className="border-b hover:bg-gray-50 text-sm">
                                  <td className="p-3 text-center">{idx + 1}</td>
                                  <td className="p-3 font-medium text-blue-700">{std.name}</td>
                                  <td className="p-3 text-center">{std.jk}</td>
                                  <td className="p-3 text-gray-600">{std.nisn}</td>
                                  <td className="p-3 text-gray-600 font-medium">{stdClass.name}</td>
                                  <td className="p-3 flex justify-center">
                                    <button onClick={() => setPrintDataQueue([enr.id])} className="px-3 py-1.5 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 flex items-center text-xs">
                                      <Printer size={14} className="mr-1"/> Cetak
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* --- TOAST --- */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-bounce print:hidden">
          <CheckCircle size={20} className="text-green-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
