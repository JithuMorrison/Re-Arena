import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TherapistDashboard = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [games, setGames] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientGames, setPatientGames] = useState({});
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showGameConfig, setShowGameConfig] = useState(false);
  const [showAssignInstructor, setShowAssignInstructor] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showPatientSessions, setShowPatientSessions] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    age: '',
    condition: ''
  });
  const [reportData, setReportData] = useState({
    title: '',
    summary: '',
    progress: '',
    recommendations: '',
    sessionIds: []
  });
  const [aiGeneratedContent, setAiGeneratedContent] = useState({
    summary: '',
    progress: '',
    recommendations: ''
  });
  const [currentReport, setCurrentReport] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [chartData, setChartData] = useState(null);
  const reportRef = useRef(null);

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiApiUrl = import.meta.env.VITE_GEMINI_API_URL;

  useEffect(() => {
    if (currentUser) {
      fetchPatients();
      fetchSessions();
      fetchAvailableGames();
      fetchInstructors();
      fetchReports();
    }
  }, [currentUser]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/therapist/patients?therapistId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setPatients(data.patients);
      } else {
        console.error('Error fetching patients:', data.error);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions?userId=${currentUser.id}&userType=therapist`);
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
        prepareChartData(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchAvailableGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/therapist/available-games');
      const data = await response.json();
      if (response.ok) {
        setGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/therapist/instructors');
      const data = await response.json();
      if (response.ok) {
        setInstructors(data.instructors);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/therapist/reports?therapistId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchPatientGames = async (patientId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/therapist/patient-games?patientId=${patientId}&therapistId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setPatientGames(data.games || {});
      }
    } catch (error) {
      console.error('Error fetching patient games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientSessions = async (patientId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/sessions?patientId=${patientId}&userType=therapist&userId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
        prepareChartData(data.sessions, patientId);
      }
    } catch (error) {
      console.error('Error fetching patient sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (sessionsData, patientId = null) => {
    const filteredSessions = patientId 
      ? sessionsData.filter(s => s.patientId === patientId)
      : sessionsData;
    
    if (filteredSessions.length === 0) {
      setChartData(null);
      return;
    }

    // Sort sessions by date
    const sortedSessions = [...filteredSessions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    const labels = sortedSessions.map(s => 
      new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    
    const scores = sortedSessions.map(s => s.gameData?.score || 0);
    const ratings = sortedSessions.map(s => s.rating || 0);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Session Scores',
          data: scores,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Ratings',
          data: ratings.map(r => r * 10), // Scale ratings to match score range
          borderColor: '#1cc88a',
          backgroundColor: 'rgba(28, 200, 138, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    });
  };

  const generateAIReport = async (therapistSuggestions, patientData, sessionData) => {
    try {
      setGeneratingAI(true);
      
      const prompt = `
        As a medical report generator, create a professional therapy progress report based on the following information:
        
        Patient Details:
        - Name: ${patientData.name}
        - Age: ${patientData.age}
        - Condition: ${patientData.condition}
        
        Recent Sessions Data:
        ${sessionData.map(s => `
          Date: ${new Date(s.date).toLocaleDateString()}
          Game: ${s.gameData?.gameName || 'Unknown'}
          Score: ${s.gameData?.score || '0'}
          Rating: ${s.rating || '0'}
          Review: ${s.review || 'No review'}
        `).join('\n')}
        
        Therapist Suggestions:
        ${therapistSuggestions}
        
        Please provide:
        1. A professional summary of progress
        2. Detailed progress assessment with metrics
        3. Recommendations for next steps
        
        Format the response as JSON with keys: summary, progress, recommendations
      `;

      const response = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        try {
          const aiText = data.candidates[0].content.parts[0].text;
          const jsonMatch = aiText.match(/```json([\s\S]*?)```/);

          let jsonString = aiText;

          if (jsonMatch) {
            jsonString = jsonMatch[1].trim(); // inside the fenced block
          }

          // Parse JSON
          const parsed = JSON.parse(jsonString);

          setAiGeneratedContent({
            summary: parsed.summary || "",
            progress: parsed.progress || "",
            recommendations: parsed.recommendations || ""
          });
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          // Fallback if JSON parsing fails
          const aiText = data.candidates[0].content.parts[0].text;

          setAiGeneratedContent({
            summary: aiText,
            progress: 'Please review and edit the AI-generated content.',
            recommendations: 'Please review and edit the AI-generated content.'
          });
        }
      }
    } catch (error) {
      console.error('Error generating AI report:', error);
      alert('Error generating AI content. Please fill in manually.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/therapist/add-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patient: newPatient
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setPatients([...patients, { ...newPatient, _id: data.patientId, userCode: data.userCode }]);
        setNewPatient({ name: '', email: '', age: '', condition: '' });
        setShowAddPatient(false);
        alert('Patient added successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignInstructor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.target);
      const instructorId = formData.get('instructorId');
      
      const response = await fetch('http://localhost:5000/api/therapist/assign-instructor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patientId: selectedPatient._id,
          instructorId: instructorId
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Instructor assigned successfully!');
        setShowAssignInstructor(false);
        fetchPatients();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error assigning instructor:', error);
      alert('Error assigning instructor');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureGames = async (patient) => {
    setSelectedPatient(patient);
    await fetchPatientGames(patient._id);
    setShowGameConfig(true);
  };

  const handleViewSessions = async (patient) => {
    setSelectedPatient(patient);
    await fetchPatientSessions(patient._id);
    setShowPatientSessions(true);
  };

  const handleCreateReport = async (patient) => {
    setSelectedPatient(patient);
    setShowCreateReport(true);
    
    // Fetch patient sessions for the report
    const response = await fetch(`http://localhost:5000/api/sessions?patientId=${patient._id}&userType=therapist&userId=${currentUser.id}`);
    const data = await response.json();
    
    if (response.ok && data.sessions.length > 0) {
      // Auto-select recent sessions for report
      const recentSessionIds = data.sessions.slice(0, 3).map(s => s._id);
      setReportData(prev => ({
        ...prev,
        sessionIds: recentSessionIds,
        title: `Progress Report - ${patient.name} - ${new Date().toLocaleDateString()}`
      }));
    }
  };

  const handleViewReport = async (report) => {
    try {
      setLoading(true);
      // Fetch full report details including sessions
      const response = await fetch(`http://localhost:5000/api/therapist/report/${report._id}?therapistId=${currentUser.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedPatient(patients.find(p => p._id === data.report.patientId));
        setCurrentReport(data.report);
        setShowReportPreview(true);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/therapist/delete-report/${reportId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        // Optionally remove the report from state to refresh UI
        setReports((prevReports) => prevReports.filter(r => r._id !== reportId));
        alert("Report deleted successfully");
      } else {
        alert(data.error || "Failed to delete report");
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Error deleting report");
    }
  };

  const handleGameConfigChange = (gameName, field, value) => {
    setPatientGames(prev => ({
      ...prev,
      [gameName]: {
        ...prev[gameName],
        [field]: value
      }
    }));
  };

  const handleSaveGameConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/therapist/update-patient-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patientId: selectedPatient._id,
          gameConfigs: patientGames
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowGameConfig(false);
        setSelectedPatient(null);
        alert('Game configurations saved successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving game config:', error);
      alert('Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReportSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData(e.target);
      const selectedSessions = formData.getAll('sessionIds');
      
      const response = await fetch('http://localhost:5000/api/therapist/create-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patientId: selectedPatient._id,
          therapistName: currentUser.name,
          reportData: {
            title: formData.get('title'),
            summary: formData.get('summary'),
            progress: formData.get('progress'),
            recommendations: formData.get('recommendations'),
            aiGenerated: aiGeneratedContent
          },
          sessionIds: selectedSessions
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Report created successfully!');
        setShowCreateReport(false);
        setReportData({
          title: '',
          summary: '',
          progress: '',
          recommendations: '',
          sessionIds: []
        });
        setAiGeneratedContent({
          summary: '',
          progress: '',
          recommendations: ''
        });
        fetchReports();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Error creating report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReportPDF = async () => {
    if (!currentReport) return;
    
    try {
      // Initialize jsPDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text('THERAPY PROGRESS REPORT', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date(currentReport.createdAt).toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      
      // Add patient details
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('PATIENT DETAILS', 20, 45);
      doc.setFontSize(11);
      
      const patient = patients.find(p => p._id === currentReport.patientId);
      const patientDetails = [
        ['Patient Name:', patient?.name || 'N/A'],
        ['Age:', patient?.age || 'N/A'],
        ['Condition:', patient?.condition || 'N/A'],
        ['Patient Code:', patient?.userCode || 'N/A'],
        ['Therapist:', currentUser.name || 'N/A'],
        ['Report Date:', new Date(currentReport.createdAt).toLocaleDateString()]
      ];
      
      // Use autoTable as a function
      autoTable(doc, {
        startY: 50,
        head: [['Field', 'Details']],
        body: patientDetails,
        theme: 'grid',
        headStyles: { fillColor: [66, 133, 244] },
        margin: { left: 20, right: 20 }
      });
      
      // Add report content
      let finalY = doc.lastAutoTable.finalY + 15;
      
      doc.setFontSize(14);
      doc.text('REPORT SUMMARY', 20, finalY);
      doc.setFontSize(11);
      finalY += 10;
      
      const summaryLines = doc.splitTextToSize(currentReport.reportData.summary, pageWidth - 40);
      doc.text(summaryLines, 20, finalY);
      finalY += (summaryLines.length * 7) + 10;
      
      doc.setFontSize(14);
      doc.text('PROGRESS ASSESSMENT', 20, finalY);
      doc.setFontSize(11);
      finalY += 10;
      
      const progressLines = doc.splitTextToSize(currentReport.reportData.progress, pageWidth - 40);
      doc.text(progressLines, 20, finalY);
      finalY += (progressLines.length * 7) + 10;

      const remainingSpace = doc.internal.pageSize.height - finalY - 30;

      if (remainingSpace < 60) {
        doc.addPage(); // Add a new page
        finalY = 20; // Reset Y position to top of new page
      }

      doc.setFontSize(14);
      doc.text('RECOMMENDATIONS', 20, finalY);
      doc.setFontSize(11);
      finalY += 10;
      
      const recommendationLines = doc.splitTextToSize(currentReport.reportData.recommendations, pageWidth - 40);
      doc.text(recommendationLines, 20, finalY);
      finalY += (recommendationLines.length * 7) + 10;
      
      // Add included sessions
      if (currentReport.sessions && currentReport.sessions.length > 0) {
        doc.setFontSize(14);
        doc.text('INCLUDED SESSIONS', 20, finalY);
        finalY += 10;
        
        const sessionData = currentReport.sessions.map(session => [
          new Date(session.date).toLocaleDateString(),
          session.gameData?.gameName || 'Unknown',
          session.gameData?.score || '0',
          session.rating || '0',
          session.review?.substring(0, 30) + '...' || 'No review'
        ]);
        
        autoTable(doc, {
          startY: finalY,
          head: [['Date', 'Game', 'Score', 'Rating', 'Review']],
          body: sessionData,
          theme: 'grid',
          headStyles: { fillColor: [66, 133, 244] },
          margin: { left: 20, right: 20 }
        });
      }
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text(`Report ID: ${currentReport._id}`, 20, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      doc.save(`Report_${patient?.name || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report');
    }
  };

  const getDefaultConfigForGame = (game) => {
    const configurableFields = game.configurable_fields || [];
    let defaultConfig = {};
    if (game.name === 'bubble_game') {
      defaultConfig = {
        enabled: true,
        difficulty: 'medium',
        game_name: game.name,
        target_score: 20,
        spawnAreaSize: 5,
        bubbleSpeedAction: 5,
        bubbleLifetime: 3,
        spawnHeight: 3,
        numBubbles: 10,
        bubbleSize: 1
      }
    }
    else {
      defaultConfig = {
        enabled: true,
        difficulty: 'medium',
        game_name: game.name,
      }
    }

    configurableFields.forEach(field => {
      if (field.default !== undefined) {
        defaultConfig[field.name] = field.default;
      }
    });

    return defaultConfig;
  };

  const initializeGameConfig = (game) => {
    const defaultConfig = getDefaultConfigForGame(game);
    setPatientGames(prev => ({
      ...prev,
      [game.name]: prev[game.name] || defaultConfig
    }));
  };

  const renderGameConfigField = (game, field, config) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            className="form-select form-select-sm"
            value={config[field.name] || field.default}
            onChange={(e) => handleGameConfigChange(game.name, field.name, e.target.value)}
          >
            {field.options.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            className="form-control form-control-sm"
            value={config[field.name] || field.default}
            onChange={(e) => handleGameConfigChange(game.name, field.name, parseFloat(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step || 1}
          />
        );

      case 'object':
        if (field.name === 'lights_green_prob') {
          return (
            <div className="spawn-area-config">
              {field.fields.map(subField => (
                <div key={subField.name} className="input-group input-group-sm mb-2">
                  <span className="input-group-text bg-light">{subField.name.replace('_', ' ').toUpperCase()}</span>
                  <input
                    type="number"
                    className="form-control"
                    step="0.1"
                    value={patientGames[game.name]?.lights_green_prob?.[subField.name] ?? subField.default}
                    onChange={(e) => handleNestedFieldChange(game.name, "lights_green_prob", subField.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  const renderBubbleGameFields = (game, config) => {
    if (game.name !== 'bubble_game') {
      return game.configurable_fields?.map(field => (
        <div key={field.name} className="mb-2">
          <label className="form-label small mb-1">
            {field.name.replace('_', ' ').toUpperCase()}
          </label>
          {renderGameConfigField(game, field, config)}
        </div>
      ));
    }

    return (
      <>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Difficulty</label>
            <select
              className="form-select form-select-sm"
              value={config.difficulty || 'medium'}
              onChange={(e) => handleGameConfigChange(game.name, 'difficulty', e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Target Score</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.target_score || 20}
              onChange={(e) => handleGameConfigChange(game.name, 'target_score', parseInt(e.target.value))}
              min="5"
              max="100"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Spawn Area Size</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.spawnAreaSize || 5}
              onChange={(e) => handleGameConfigChange(game.name, 'spawnAreaSize', parseFloat(e.target.value))}
              min="1"
              max="10"
              step="0.1"
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Bubble Speed</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.bubbleSpeedAction || 5}
              onChange={(e) => handleGameConfigChange(game.name, 'bubbleSpeedAction', parseFloat(e.target.value))}
              min="1"
              max="10"
              step="0.1"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Bubble Lifetime</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.bubbleLifetime || 3}
              onChange={(e) => handleGameConfigChange(game.name, 'bubbleLifetime', parseFloat(e.target.value))}
              min="1"
              max="10"
              step="0.1"
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Spawn Height</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.spawnHeight || 3}
              onChange={(e) => handleGameConfigChange(game.name, 'spawnHeight', parseFloat(e.target.value))}
              min="1"
              max="10"
              step="0.1"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Number of Bubbles</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.numBubbles || 10}
              onChange={(e) => handleGameConfigChange(game.name, 'numBubbles', parseInt(e.target.value))}
              min="1"
              max="20"
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Bubble Size</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.bubbleSize || 1}
              onChange={(e) => handleGameConfigChange(game.name, 'bubbleSize', parseFloat(e.target.value))}
              min="0.1"
              max="5"
              step="0.1"
            />
          </div>
        </div>
      </>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-circle" style={{ backgroundColor: `${color}15` }}>
              <i className={`bi bi-${icon}`} style={{ fontSize: '1.8rem', color: color }}></i>
            </div>
          </div>
          <div className="flex-grow-1 ms-3">
            <h6 className="text-muted text-uppercase small mb-1">{title}</h6>
            <h2 className="mb-0 fw-bold" style={{ color: color }}>{value}</h2>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
        </div>
      </div>
    </div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Score'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Rating (x10)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  if (loading && !showGameConfig && !showAssignInstructor && !showCreateReport && !showPatientSessions && !showReportPreview) {
    return (
      <div className="container-fluid py-5">
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 bg-light min-vh-100" style={{marginTop: '100px'}}>
      {/* Main Content */}
      <div className="container-fluid py-4">
        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <StatCard 
              title="Total Patients" 
              value={patients.length} 
              icon="people-fill" 
              color="#4e73df"
              subtitle="Active patients"
            />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatCard 
              title="Sessions" 
              value={sessions.length} 
              icon="calendar-check" 
              color="#1cc88a"
              subtitle="This month"
            />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatCard 
              title="Avg. Rating" 
              value={sessions.length > 0 
                ? (sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length).toFixed(1)
                : '0.0'
              }
              icon="star-fill" 
              color="#f6c23e"
              subtitle="Overall satisfaction"
            />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatCard 
              title="Reports" 
              value={reports.length} 
              icon="file-earmark-text" 
              color="#e74a3b"
              subtitle="Generated reports"
            />
          </div>
        </div>

        {/* Chart Section */}
        {chartData && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Progress Overview
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <div className="card shadow-sm">
          <div className="card-header bg-white border-bottom-0 p-0">
            <ul className="nav nav-tabs nav-tabs-custom px-3 pt-3">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('patients')}
                >
                  <i className="bi bi-people me-2"></i>
                  Patients
                  <span className="badge bg-primary ms-2">{patients.length}</span>
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reports')}
                >
                  <i className="bi bi-file-text me-2"></i>
                  Reports
                  <span className="badge bg-success ms-2">{reports.length}</span>
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'sessions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sessions')}
                >
                  <i className="bi bi-calendar-week me-2"></i>
                  Sessions
                  <span className="badge bg-info ms-2">{sessions.length}</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        <i className="bi bi-activity me-2"></i>
                        Recent Activity
                      </h5>
                    </div>
                    <div className="card-body p-0">
                      {sessions.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-calendar-x display-1 text-muted"></i>
                          <p className="mt-3 text-muted">No recent sessions found</p>
                        </div>
                      ) : (
                        <div className="list-group list-group-flush">
                          {sessions.slice(0, 5).map(session => {
                            const patient = patients.find(p => p._id === session.patientId);
                            return (
                              <div key={session._id} className="list-group-item border-0 px-4 py-3 hover-bg">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar avatar-sm bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                      <i className="bi bi-person"></i>
                                    </div>
                                    <div>
                                      <h6 className="mb-1">{patient?.name || 'Unknown Patient'}</h6>
                                      <p className="text-muted small mb-0">
                                        <i className="bi bi-controller me-1"></i>
                                        {session.gameData?.gameName || 'Unknown Game'}
                                        <span className="mx-2">•</span>
                                        <i className="bi bi-clock me-1"></i>
                                        {new Date(session.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <span className={`badge ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-warning' : 'bg-danger'}`}>
                                      {session.rating || '0'}/5
                                    </span>
                                    <span className="badge bg-light text-dark ms-2">
                                      Score: {session.gameData?.score || '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        <i className="bi bi-lightning-charge me-2"></i>
                        Quick Actions
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="d-grid gap-3">
                        <button 
                          className="btn btn-primary btn-lg d-flex align-items-center justify-content-start p-3"
                          onClick={() => {
                            setActiveTab('patients');
                            setShowAddPatient(true);
                          }}
                        >
                          <div className="icon-wrapper me-3">
                            <i className="bi bi-person-plus fs-4"></i>
                          </div>
                          <div className="text-start">
                            <div className="fw-bold">Add New Patient</div>
                            <small className="opacity-75">Register a new patient</small>
                          </div>
                        </button>
                        
                        <button 
                          className="btn btn-success btn-lg d-flex align-items-center justify-content-start p-3"
                          onClick={() => {
                            if (patients.length > 0) {
                              handleCreateReport(patients[0]);
                            }
                          }}
                          disabled={patients.length === 0}
                        >
                          <div className="icon-wrapper me-3">
                            <i className="bi bi-file-earmark-medical fs-4"></i>
                          </div>
                          <div className="text-start">
                            <div className="fw-bold">Create Report</div>
                            <small className="opacity-75">Generate patient report</small>
                          </div>
                        </button>

                        <button 
                          className="btn btn-info btn-lg d-flex align-items-center justify-content-start p-3"
                          onClick={() => setActiveTab('sessions')}
                        >
                          <div className="icon-wrapper me-3">
                            <i className="bi bi-graph-up fs-4"></i>
                          </div>
                          <div className="text-start">
                            <div className="fw-bold">View Analytics</div>
                            <small className="opacity-75">See session analytics</small>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Patients Tab */}
            {activeTab === 'patients' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-0">
                      <i className="bi bi-people me-2"></i>
                      Patient Management
                    </h5>
                    <p className="text-muted mb-0">Manage your patients and their configurations</p>
                  </div>
                  <button 
                    className="btn btn-primary d-flex align-items-center"
                    onClick={() => setShowAddPatient(true)}
                    disabled={loading}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Add New Patient
                  </button>
                </div>

                {showAddPatient && (
                  <div className="card border-primary mb-4 shadow-sm">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-person-plus me-2"></i>
                        Register New Patient
                      </h5>
                      <button 
                        type="button" 
                        className="btn-close btn-close-white"
                        onClick={() => setShowAddPatient(false)}
                        disabled={loading}
                      ></button>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleAddPatient}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Full Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newPatient.name}
                              onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                              required
                              disabled={loading}
                              placeholder="Enter patient's full name"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email Address *</label>
                            <input
                              type="email"
                              className="form-control"
                              value={newPatient.email}
                              onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                              required
                              disabled={loading}
                              placeholder="patient@example.com"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Age *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newPatient.age}
                              onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                              required
                              disabled={loading}
                              placeholder="Enter age"
                              min="1"
                              max="120"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Medical Condition *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newPatient.condition}
                              onChange={(e) => setNewPatient({...newPatient, condition: e.target.value})}
                              required
                              disabled={loading}
                              placeholder="e.g., Stroke Recovery, PTSD"
                            />
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-4">
                          <button type="submit" className="btn btn-success px-4" disabled={loading}>
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Adding Patient...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Add Patient
                              </>
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary"
                            onClick={() => setShowAddPatient(false)}
                            disabled={loading}
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {patients.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-people display-1 text-muted"></i>
                    <h4 className="mt-3 text-muted">No Patients Found</h4>
                    <p className="text-muted">Add your first patient to get started</p>
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={() => setShowAddPatient(true)}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Add First Patient
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4">Patient</th>
                          <th>Email</th>
                          <th>Age</th>
                          <th>Condition</th>
                          <th>Access Code</th>
                          <th>Status</th>
                          <th className="text-end pe-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map(patient => (
                          <tr key={patient._id} className="hover-row">
                            <td className="ps-4">
                              <div className="d-flex align-items-center">
                                <div className="avatar avatar-sm bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                  <i className="bi bi-person"></i>
                                </div>
                                <div>
                                  <strong>{patient.name}</strong>
                                  <div className="text-muted small">ID: {patient._id?.substring(0, 8)}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <a href={`mailto:${patient.email}`} className="text-decoration-none">
                                {patient.email}
                              </a>
                            </td>
                            <td><span className="badge bg-secondary">{patient.age} years</span></td>
                            <td>
                              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                                {patient.condition}
                              </span>
                            </td>
                            <td>
                              <code className="bg-light p-2 rounded border user-select-all">{patient.userCode}</code>
                            </td>
                            <td>
                              <span className="badge bg-success bg-opacity-10 text-success">
                                Active
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <div className="btn-group btn-group-sm" role="group">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => handleConfigureGames(patient)}
                                  title="Configure Games"
                                >
                                  <i className="bi bi-gear"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-info"
                                  onClick={() => handleViewSessions(patient)}
                                  title="View Sessions"
                                >
                                  <i className="bi bi-calendar-week"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-success"
                                  onClick={() => {
                                    setSelectedPatient(patient);
                                    setShowAssignInstructor(true);
                                  }}
                                  title="Assign Instructor"
                                >
                                  <i className="bi bi-person-plus"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-warning"
                                  onClick={() => handleCreateReport(patient)}
                                  title="Create Report"
                                >
                                  <i className="bi bi-file-text"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-0">
                      <i className="bi bi-file-text me-2"></i>
                      Patient Reports
                    </h5>
                    <p className="text-muted mb-0">View and manage generated reports</p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      if (patients.length > 0) {
                        handleCreateReport(patients[0]);
                      }
                    }}
                    disabled={patients.length === 0}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    New Report
                  </button>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                    <h4 className="mt-3 text-muted">No Reports Found</h4>
                    <p className="text-muted">Create your first patient report</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {reports.map(report => {
                      const patient = patients.find(p => p._id === report.patientId);

                      return (
                        <div key={report._id} className="col-md-6 col-lg-4">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">

                              <div className="mb-3">
                                <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
                                  {patient ? patient.name : 'Unknown Patient'}
                                </span>
                                <h5 className="card-title mb-2">{report.reportData?.title || 'Untitled Report'}</h5>
                              </div>

                              <p className="card-text text-muted small mb-3">
                                {report.reportData?.summary
                                  ? `${report.reportData.summary.substring(0, 120)}...`
                                  : "No summary available"}
                              </p>

                              {/* Buttons instead of dropdown */}
                              <div className="d-flex gap-2 mb-3">
                                {/* View Button */}
                                <button className="btn btn-sm btn-primary" onClick={() => handleViewReport(report)}>
                                  <i className="bi bi-eye me-1"></i> View
                                </button>

                                {/* Download Button */}
                                <button className="btn btn-sm btn-secondary" onClick={() => {
                                  setSelectedPatient(patients.find(p => p._id === report.patientId));
                                  setCurrentReport(report);
                                  downloadReportPDF();
                                }}>
                                  <i className="bi bi-download me-1"></i> Download
                                </button>

                                {/* Delete Button */}
                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReport(report._id)}>
                                  <i className="bi bi-trash me-1"></i> Delete
                                </button>
                              </div>

                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <i className="bi bi-calendar me-1"></i>
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </small>
                                <div className="badge bg-light text-dark">
                                  <i className="bi bi-file-pdf me-1"></i> PDF
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-0">
                      <i className="bi bi-calendar-week me-2"></i>
                      Session History
                    </h5>
                    <p className="text-muted mb-0">Track all therapy sessions</p>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary">
                      <i className="bi bi-filter me-2"></i>
                      Filter
                    </button>
                    <button className="btn btn-outline-secondary">
                      <i className="bi bi-download me-2"></i>
                      Export
                    </button>
                  </div>
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x display-1 text-muted"></i>
                    <h4 className="mt-3 text-muted">No Sessions Found</h4>
                    <p className="text-muted">Patient sessions will appear here</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Patient</th>
                          <th>Date & Time</th>
                          <th>Game</th>
                          <th>Score</th>
                          <th>Rating</th>
                          <th>Review</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.slice(0, 10).map(session => {
                          const patient = patients.find(p => p._id === session.patientId);
                          return (
                            <tr key={session._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar avatar-sm bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2">
                                    <i className="bi bi-person"></i>
                                  </div>
                                  <span>{patient?.name || 'Unknown'}</span>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{new Date(session.date).toLocaleDateString()}</div>
                                  <small className="text-muted">{new Date(session.date).toLocaleTimeString()}</small>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-info bg-opacity-10 text-info">
                                  {session.gameData?.gameName || 'Unknown'}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                    <div 
                                      className="progress-bar bg-primary" 
                                      style={{ width: `${Math.min((session.gameData?.score || 0) / 100 * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="fw-bold">{session.gameData?.score || '0'}</span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="stars me-2">
                                    {[...Array(5)].map((_, i) => (
                                      <i 
                                        key={i}
                                        className={`bi bi-star${i < Math.floor(session.rating || 0) ? '-fill' : ''} text-warning`}
                                      ></i>
                                    ))}
                                  </div>
                                  <span className="small">{(session.rating || 0).toFixed(1)}</span>
                                </div>
                              </td>
                              <td>
                                <div className="text-truncate" style={{ maxWidth: '150px' }} title={session.review}>
                                  {session.review || 'No review'}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${session.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                  {session.status || 'completed'}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="bi bi-eye"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Game Configuration Modal */}
      {showGameConfig && selectedPatient && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-gear me-2"></i>
                  Game Configuration for {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowGameConfig(false)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Configure game settings for {selectedPatient.name}. Enable/disable games and adjust parameters as needed.
                </div>
                <div className="row">
                  {games.map(game => {
                    const config = patientGames[game.name] || getDefaultConfigForGame(game);
                    return (
                      <div key={game.name} className="col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-header bg-white border-bottom">
                            <div className="form-check form-switch form-switch-lg">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={config.enabled !== false}
                                onChange={(e) => {
                                  initializeGameConfig(game);
                                  handleGameConfigChange(game.name, 'enabled', e.target.checked);
                                }}
                                disabled={loading}
                              />
                              <label className="form-check-label fw-bold">
                                <i className="bi bi-controller me-2"></i>
                                {game.display_name || game.name}
                              </label>
                            </div>
                          </div>
                          <div className="card-body">
                            {config.enabled !== false && (
                              <>
                                <p className="text-muted small mb-3">{game.description}</p>
                                <div className="border-top pt-3">
                                  {renderBubbleGameFields(game, config)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowGameConfig(false)}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveGameConfig}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Instructor Modal */}
      {showAssignInstructor && selectedPatient && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>
                  Assign Instructor to {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowAssignInstructor(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAssignInstructor}>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Select Instructor</label>
                    <select name="instructorId" className="form-select form-select-lg" required>
                      <option value="">Choose an instructor...</option>
                      {instructors.map(instructor => (
                        <option key={instructor._id} value={instructor.userId}>
                          {instructor.name} - {instructor.email}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      This instructor will have access to monitor {selectedPatient.name}'s progress.
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success flex-grow-1" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Assign Instructor
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAssignInstructor(false)}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateReport && selectedPatient && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning text-white">
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-medical me-2"></i>
                  Create Report for {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateReport(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card border-primary">
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-person me-2"></i>
                          Patient Details
                        </h6>
                      </div>
                      <div className="card-body">
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <th>Name:</th>
                              <td>{selectedPatient.name}</td>
                            </tr>
                            <tr>
                              <th>Age:</th>
                              <td>{selectedPatient.age}</td>
                            </tr>
                            <tr>
                              <th>Condition:</th>
                              <td>{selectedPatient.condition}</td>
                            </tr>
                            <tr>
                              <th>Patient Code:</th>
                              <td><code>{selectedPatient.userCode}</code></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-info">
                      <div className="card-header bg-info text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-robot me-2"></i>
                          AI Report Assistant
                        </h6>
                      </div>
                      <div className="card-body">
                        <p className="small text-muted mb-3">
                          Use AI to generate a draft report based on patient's session data and your suggestions.
                        </p>
                        <button 
                          type="button" 
                          className="btn btn-outline-info w-100"
                          onClick={() => {
                            const patientSessions = sessions.filter(s => s.patientId === selectedPatient._id);
                            generateAIReport(
                              `summary_related_info : ${reportData.summary}, progress_related_info : ${reportData.progress}, recommendations_related_info : ${reportData.recommendations}
                              
                              give as string content for all three fields`,
                              selectedPatient,
                              patientSessions
                            );
                          }}
                          disabled={generatingAI}
                        >
                          {generatingAI ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Generating AI Report...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-magic me-2"></i>
                              Generate with AI
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateReportSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Report Title</label>
                    <input 
                      type="text" 
                      name="title"
                      className="form-control form-control-lg" 
                      value={reportData.title}
                      onChange={(e) => setReportData({...reportData, title: e.target.value})}
                      required 
                      placeholder="Enter report title"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Summary</label>
                    <textarea 
                      name="summary"
                      className="form-control" 
                      rows="3" 
                      value={reportData.summary}
                      onChange={(e) => setReportData({...reportData, summary: e.target.value})}
                      required 
                      placeholder="Provide a brief summary of the patient's progress"
                    ></textarea>
                    {aiGeneratedContent.summary && (
                      <>
                        <div className="alert alert-info mt-2 small">
                          <strong>AI Suggestion:</strong> {aiGeneratedContent.summary}
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-sm btn-link" onClick={() => setReportData({...reportData, summary: aiGeneratedContent.summary})}>Apply</button>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Progress Assessment</label>
                    <textarea 
                      name="progress"
                      className="form-control" 
                      rows="3" 
                      value={reportData.progress}
                      onChange={(e) => setReportData({...reportData, progress: e.target.value})}
                      required 
                      placeholder="Detail the patient's progress and achievements"
                    ></textarea>
                    {aiGeneratedContent.progress && (
                      <>
                        <div className="alert alert-info mt-2 small">
                          <strong>AI Suggestion:</strong> {aiGeneratedContent.progress}
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-sm btn-link" onClick={() => setReportData({...reportData, progress: aiGeneratedContent.progress})}>Apply</button>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Recommendations</label>
                    <textarea 
                      name="recommendations"
                      className="form-control" 
                      rows="3" 
                      value={reportData.recommendations}
                      onChange={(e) => setReportData({...reportData, recommendations: e.target.value})}
                      required 
                      placeholder="Provide recommendations for next steps"
                    ></textarea>
                    {aiGeneratedContent.recommendations && (
                      <>
                        <div className="alert alert-info mt-2 small">
                          <strong>AI Suggestion:</strong> {aiGeneratedContent.recommendations}
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-sm btn-link" onClick={() => setReportData({...reportData, recommendations: aiGeneratedContent.recommendations})}>Apply</button>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-bold">Include Sessions</label>
                    <div className="border rounded p-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {sessions.filter(s => s.patientId === selectedPatient._id).map(session => (
                        <div key={session._id} className="form-check mb-2">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            name="sessionIds"
                            value={session._id} 
                            id={`session-${session._id}`}
                            checked={reportData.sessionIds.includes(session._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReportData({
                                  ...reportData,
                                  sessionIds: [...reportData.sessionIds, session._id]
                                });
                              } else {
                                setReportData({
                                  ...reportData,
                                  sessionIds: reportData.sessionIds.filter(id => id !== session._id)
                                });
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor={`session-${session._id}`}>
                            <span className="fw-bold">{new Date(session.date).toLocaleDateString()}</span>
                            <span className="text-muted ms-2">
                              - {session.gameData?.gameName || 'Unknown Game'} (Score: {session.gameData?.score || '0'})
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="form-text">
                      Select sessions to include in this report
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-warning flex-grow-1" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-file-earmark-plus me-2"></i>
                          Create Report
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCreateReport(false)}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showReportPreview && currentReport && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Report Preview
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowReportPreview(false)}
                ></button>
              </div>
              <div className="modal-body" ref={reportRef}>
                <div className="report-container p-4">
                  {/* Report Header */}
                  <div className="text-center mb-5 border-bottom pb-4">
                    <h1 className="text-primary mb-3">THERAPY PROGRESS REPORT</h1>
                    <p className="text-muted mb-0">
                      Generated on: {new Date(currentReport.createdAt).toLocaleDateString()} | 
                      Report ID: {currentReport._id}
                    </p>
                  </div>

                  {/* Patient Details */}
                  <div className="row mb-5">
                    <div className="col-md-6">
                      <h5 className="text-primary mb-3">
                        <i className="bi bi-person me-2"></i>
                        Patient Information
                      </h5>
                      <table className="table table-bordered">
                        <tbody>
                          <tr>
                            <th className="bg-light">Patient Name:</th>
                            <td>{selectedPatient?.name || 'N/A'}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Age:</th>
                            <td>{selectedPatient?.age || 'N/A'}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Condition:</th>
                            <td>{selectedPatient?.condition || 'N/A'}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Patient Code:</th>
                            <td><code>{selectedPatient?.userCode || 'N/A'}</code></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h5 className="text-primary mb-3">
                        <i className="bi bi-person-badge me-2"></i>
                        Therapist Information
                      </h5>
                      <table className="table table-bordered">
                        <tbody>
                          <tr>
                            <th className="bg-light">Therapist:</th>
                            <td>{currentUser.name}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Report Date:</th>
                            <td>{new Date(currentReport.createdAt).toLocaleDateString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="mb-5">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-file-text me-2"></i>
                      Report Summary
                    </h5>
                    <div className="p-3 bg-light rounded">
                      <p className="mb-0">{currentReport.reportData.summary}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-graph-up me-2"></i>
                      Progress Assessment
                    </h5>
                    <div className="p-3 bg-light rounded">
                      <p className="mb-0">{currentReport.reportData.progress}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-lightbulb me-2"></i>
                      Recommendations
                    </h5>
                    <div className="p-3 bg-light rounded">
                      <p className="mb-0">{currentReport.reportData.recommendations}</p>
                    </div>
                  </div>

                  {/* Session Data */}
                  {currentReport.sessions && currentReport.sessions.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-primary mb-3">
                        <i className="bi bi-calendar-week me-2"></i>
                        Included Session Data
                      </h5>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-primary">
                            <tr>
                              <th>Date</th>
                              <th>Game</th>
                              <th>Score</th>
                              <th>Rating</th>
                              <th>Duration</th>
                              <th>Review</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentReport.sessions.map(session => (
                              <tr key={session._id}>
                                <td>{new Date(session.date).toLocaleDateString()}</td>
                                <td>{session.gameData?.gameName || 'Unknown'}</td>
                                <td>{session.gameData?.score || '0'}</td>
                                <td>
                                  <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                      <i 
                                        key={i}
                                        className={`bi bi-star${i < Math.floor(session.rating || 0) ? '-fill' : ''} text-warning`}
                                      ></i>
                                    ))}
                                    <span className="ms-2">({session.rating || '0'}/5)</span>
                                  </div>
                                </td>
                                <td>{session.duration || '180s'}</td>
                                <td>{session.review || 'No review'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-top pt-4 mt-4 text-center text-muted">
                    <p className="mb-1">This report was generated by the Therapy Management System</p>
                    <small>Report ID: {currentReport._id} | Version 1.0</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowReportPreview(false)}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={downloadReportPDF}
                >
                  <i className="bi bi-download me-2"></i>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Sessions Modal */}
      {showPatientSessions && selectedPatient && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="bi bi-calendar-week me-2"></i>
                  Sessions for {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowPatientSessions(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Session Chart */}
                {chartData && (
                  <div className="card mb-4">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Progress Chart</h6>
                      <div style={{ height: '250px' }}>
                        <Line data={chartData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Game</th>
                        <th>Score</th>
                        <th>Duration</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.filter(s => s.patientId === selectedPatient._id).map(session => (
                        <tr key={session._id}>
                          <td>
                            <div className="d-flex flex-column">
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                              <small className="text-muted">{new Date(session.date).toLocaleTimeString()}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info bg-opacity-10 text-info">
                              {session.gameData?.gameName || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold">{session.gameData?.score || '0'}</span>
                          </td>
                          <td>
                            <span className="text-muted">{session.duration || '180s'}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar bg-warning" 
                                  style={{ width: `${(session.rating || 0) * 20}%` }}
                                ></div>
                              </div>
                              <span className="small">{session.rating || '0'}/5</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              {session.review || 'No review'}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${session.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {session.status || 'completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPatientSessions(false)}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for better styling */}
      <style jsx>{`
        .hover-row:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }
        
        .hover-bg:hover {
          background-color: #f8f9fa !important;
        }
        
        .nav-tabs-custom .nav-link {
          border: none;
          border-bottom: 3px solid transparent;
          padding: 0.75rem 1rem;
          color: #6c757d;
          font-weight: 500;
        }
        
        .nav-tabs-custom .nav-link.active {
          color: #4e73df;
          border-bottom-color: #4e73df;
          background-color: transparent;
        }
        
        .nav-tabs-custom .nav-link:hover {
          color: #4e73df;
        }
        
        .icon-wrapper {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(78, 115, 223, 0.1);
          border-radius: 8px;
        }
        
        .avatar {
          width: 40px;
          height: 40px;
        }
        
        .avatar-sm {
          width: 32px;
          height: 32px;
        }
        
        .stars {
          color: #ffc107;
        }
        
        .report-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .btn-group-sm .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        
        .user-select-all {
          user-select: all;
        }
      `}</style>

      {/* Add Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
    </div>
  );
};

export default TherapistDashboard;