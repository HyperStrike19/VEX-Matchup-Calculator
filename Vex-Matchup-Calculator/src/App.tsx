import { useState } from 'react';

var overviewTeamName = '';
var h2hTeamAName = '';
var h2hTeamBName = '';

export default function App() {
  // --- STATE (Memory) ---
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState('overview');
  const [teamA_Input, setTeamA_Input] = useState('');
  const [teamB_Input, setTeamB_Input] = useState('');
  const [overviewTeam, setOverviewTeam] = useState('');

  // ==========================================
  // FETCH LOGIC (Runs when you click the button)
  // ==========================================
  const fetchTeamSeason = async (searchNumber, type) => {
    try {
      // 1. UNCOMMENT THIS AND ADD YOUR ACTUAL TOKEN
      const headers = { 
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMWYwMDA5ODdhZjFjODFlY2M2Zjg1Nzc2YzhkYmFkZWViMWI1NTM0OTcwOWEzYjhiNGM0ZWRlYmY4NGE1NzBmMzJlMDJlMDliZDMxOWRmZDkiLCJpYXQiOjE3NzYzNjkwNjMuMTM4ODQyMSwibmJmIjoxNzc2MzY5MDYzLjEzODg0NCwiZXhwIjoyNzIzMTQwMjYzLjEzMzY2NDEsInN1YiI6IjE1OTQ0NSIsInNjb3BlcyI6W119.L1b8M29nPICa8H8u4vsgPYLaS88q9k9g4qcPSAeTtKw3z0lGbLQydpb9a4k02c9qfvviTcLdtGLezcRdTYc867r9aflOMd6JJUqFUxJ9byXf694yRICVkPq-HQaNbsRd8J7bY4kPos45CeDqrg5xx_3EBV4jQKxR3wQN5qac9jdrMr5Fn4BqG8Zj8ApbT3CKZ1G6CLEljuBrqNxd0QP0VBHCuT126oytk_rkhIEMTZEA_6XzjAT9Sbedl0BNRXbf5Azeyz-BL87Tq-MJyf_KxFqgTVr6NgcvAk4VvZTfSG332-lEVabcifVNX0VV23uKgb-SXy3dSUInC37zvvorRZ5C5rNXtmWd-mvh-rrZw9-LtldPczNVvo0JIsaq38-cRyQOTNNRogXE4ltSx6MC9sBKKiblzj0sj6wqZTy-3xwdaGhbwwV7euUQsFLMa7-N-74LUJwjd5g51SyBhE1ybMzo9Z8vurQsCBEPdEP8dHrJybBdwsKTh4FPH7fpG4PoZ-XR4yOr0B5tZqUZF4sMlFGkxemWyxLWCdR32p_HibA6ZOehZNg_UiTeN8paAl90rsj-CUtPQVg9DSmG5e22YclAI7LseNPnxy12d03ZDGbyyGdA8fqFXQG4j4fDonZmICGdGPtKKl_n6CMNSkIi7GVvRvkb9ACFmvYB_Cjvlq8',
        'Accept': 'application/json' 
      };
  
      // ==========================================
      // STEP 1: GET THE CORRECT TEAM ID & NAME
      // ==========================================
      const teamResponse = await fetch(
        `https://www.robotevents.com/api/v2/teams?number=${searchNumber}&per_page=250`, 
        { headers } // <-- 2. ADD THE HEADERS HERE!
      );
      const teamJson = await teamResponse.json();
  
      if (!teamJson.data || teamJson.data.length === 0) {
        console.log("Team not found in RobotEvents!");
        return; 
      }
  
      // 1. Sort ALL their historical profiles newest to oldest
      const sortedProfiles = teamJson.data.sort((a, b) => b.id - a.id);
    
      // 2. Grab the newest ID for the match lookup
      const correctTeamId = sortedProfiles[0].id;
    
      // 3. Dig through the history to find the newest profile that actually has a name typed in
      const profileWithName = sortedProfiles.find(
        (profile) => profile.team_name && profile.team_name.trim() !== ""
      );

      const actualTeamName = profileWithName ? profileWithName.team_name : "Unknown Name";

      // 4. Save the name to your state!
      if(type == 1){
        setOverviewTeamName(actualTeamName);
      }else if(type == 2){
        setATeamName(actualTeamName);
      }else if(type == 3){
        setBTeamName(actualTeamName);
      }
      //overviewTeamName = actualTeamName;
      console.log(`Found Team: ${searchNumber} - ${actualTeamName} (ID: ${correctTeamId})`);
  
      // ==========================================
      // STEP 2: FETCH MATCHES FOR CURRENT SEASON
      // ==========================================
      const matchResponse = await fetch(
        `https://www.robotevents.com/api/v2/teams/${correctTeamId}/matches?season[]=197&per_page=250`, 
        { headers } // <-- 3. ADD THE HEADERS HERE TOO!
      );
      const matchJson = await matchResponse.json();
  
      if (!matchJson.data) {
        console.log("No matches found for this season.");
        return;
      }
  
      // ==========================================
    // STEP 3: FILTER & FORMAT THE DATA
    // ==========================================
    // 1. Filter out practice matches (round 1)
    const officialMatches = matchJson.data.filter((match) => match.round !== 1);

    // 2. Translate the raw API data into the clean format your math functions expect
    const formattedMatches = officialMatches.map((match) => {
      // Find the red and blue alliance objects in the raw data
      const redAllianceData = match.alliances.find(a => a.color === 'red');
      const blueAllianceData = match.alliances.find(a => a.color === 'blue');

      return {
        ...match, // Keep all the original match data (like match name, round, etc.)
        
        // Extract the scores safely
        redScore: redAllianceData ? redAllianceData.score : 0,
        blueScore: blueAllianceData ? blueAllianceData.score : 0,
        
        // Extract just the team numbers into a simple array (e.g., ["38535A", "123B"])
        redAlliance: redAllianceData 
          ? redAllianceData.teams.map(t => t.team.name) 
          : [],
        blueAlliance: blueAllianceData 
          ? blueAllianceData.teams.map(t => t.team.name) 
          : []
      };
    });

    console.log(`Downloaded and formatted ${formattedMatches.length} official matches!`);

    // 👉 IMPORTANT: Make sure you are actually saving the data to your state!
    // It should look something like this, using 'formattedMatches':
    setLiveMatches(formattedMatches);
  
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  // ==========================================
  // LOGIC SKELETON: HEAD-TO-HEAD PAGE
  // ==========================================

  const fetchH2HMatches = (teamA_Input, teamB_Input) => {
    fetchTeamSeason(teamA_Input, 2)
    fetchTeamSeason(teamB_Input, 3)
  }

  // TODO: Calculate how many total matches Team A and Team B played against each other on opposite alliances.
  const getHeadToHeadTotalMatches = () => {
    // Your logic here...
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const headToHeadMatches = officialMatches.filter(match => 
      (match.redAlliance.includes(teamA_Input) && match.blueAlliance.includes(teamB_Input)) || 
      (match.redAlliance.includes(teamB_Input) && match.blueAlliance.includes(teamA_Input))
    );
    return headToHeadMatches.length; 
  };

  // TODO: Calculate how many times Team A won against Team B.
  const getTeamAWins = () => {
    // Your logic here...
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const headToHeadMatches = officialMatches.filter(match => 
      (match.redAlliance.includes(teamA_Input) && match.blueAlliance.includes(teamB_Input)) || 
      (match.redAlliance.includes(teamB_Input) && match.blueAlliance.includes(teamA_Input))
    );
    const aWinningMatches = headToHeadMatches.filter(match => 
      (match.redScore > match.blueScore && match.redAlliance.includes(teamA_Input)) || 
      (match.redScore < match.blueScore && match.blueAlliance.includes(teamA_Input))
    );
    console.log(aWinningMatches);
    return aWinningMatches.length; 
  };

  // TODO: Calculate how many times Team B won against Team A.
  const getTeamBWins = () => {
    // Your logic here...
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const headToHeadMatches = officialMatches.filter(match => 
      (match.redAlliance.includes(teamA_Input) && match.blueAlliance.includes(teamB_Input)) || 
      (match.redAlliance.includes(teamB_Input) && match.blueAlliance.includes(teamA_Input))
    );
    const bWinningMatches = headToHeadMatches.filter(match => 
      (match.redScore > match.blueScore && match.redAlliance.includes(teamB_Input)) || 
      (match.redScore < match.blueScore && match.blueAlliance.includes(teamB_Input))
    );
    console.log(bWinningMatches);
    return bWinningMatches.length;
  };

  // TODO: Calculate how many times Team B won against Team A.
  const getH2hTies = () => {
    // Your logic here...
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const headToHeadMatches = officialMatches.filter(match => 
      (match.redAlliance.includes(teamA_Input) && match.blueAlliance.includes(teamB_Input)) || 
      (match.redAlliance.includes(teamB_Input) && match.blueAlliance.includes(teamA_Input))
    );
    const ties = headToHeadMatches.filter(match => match.redScore == match.blueScore);
    console.log(ties);
    return ties.length;
  };

  // TODO: Calculate a team's win percentage. 
  // Remember to handle the edge case where total matches is 0 so you don't divide by zero!
  const getWinPercentage = (wins: number, total: number) => {
    // Your logic here...
    if(total == 0){
      return(0);
    }
    var winPercent = (wins / total) * 100;
    winPercent = Math.round(winPercent * 100) / 100;
    return winPercent; 
  };

  // ==========================================
  // LOGIC SKELETON: OVERVIEW PAGE
  // ==========================================

  // TODO: Calculate total wins across all matches for the `overviewTeam`.
  const getTotalWins = () => {
    // Your logic here...
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const allMatches = officialMatches.filter(match => 
      match.redAlliance.includes(overviewTeam) || match.blueAlliance.includes(overviewTeam)
    ); 
    const wins = allMatches.filter(match => 
      (match.redScore > match.blueScore && match.redAlliance.includes(overviewTeam)) || 
      (match.redScore < match.blueScore && match.blueAlliance.includes(overviewTeam))
    ); 
    console.log(wins);
    return(wins.length);
  };

  // TODO: Calculate total losses across all matches for the `overviewTeam`.
  const getTotalLosses = () => {
    // Your logic here...
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const allMatches = officialMatches.filter(match => 
      match.redAlliance.includes(overviewTeam) || match.blueAlliance.includes(overviewTeam)
    ); 
    const losses = allMatches.filter(match => 
      (match.redScore < match.blueScore && match.redAlliance.includes(overviewTeam)) || 
      (match.redScore > match.blueScore && match.blueAlliance.includes(overviewTeam))
    ); 
    console.log(losses);
    return(losses.length);
  };

  // TODO: Calculate total ties across all matches for the `overviewTeam`.
  const getTotalTies = () => {
    // Your logic here...
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const allMatches = officialMatches.filter(match => 
      match.redAlliance.includes(overviewTeam) || match.blueAlliance.includes(overviewTeam)
    ); 
    const ties = allMatches.filter(match => (match.redScore == match.blueScore)); 
    console.log(ties);
    return(ties.length);
  };

  // TODO: Calculate overall win percentage for the `overviewTeam`.
  const getOverallWinPct = () => {
    // Your logic here...
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const allMatches = officialMatches.filter(match => 
      match.redAlliance.includes(overviewTeam) || match.blueAlliance.includes(overviewTeam)
    ); 
    const wins = allMatches.filter(match => 
      (match.redScore > match.blueScore && match.redAlliance.includes(overviewTeam)) || 
      (match.redScore < match.blueScore && match.blueAlliance.includes(overviewTeam))
    ); 
    if(wins.length == 0){
      return "0.00";
    }
    var winPercent = wins.length / allMatches.length * 100;
    winPercent = Math.round(winPercent * 100) / 100;
    return winPercent; 
  };

  const getMatchups = () => {
    // 1. Tell TypeScript EXACTLY what the opponent stats will look like
    type OpponentStats = { team: string; wins: number; losses: number; ties: number; };
    
    // 2. Apply that blueprint to our tracker object
    const opponentTracker: Record<string, OpponentStats> = {};

    // 2. Filter to official matches that include our team
    const officialMatches = liveMatches.filter((match) => match.round !== 1);
    const allMatches = officialMatches.filter((match) =>
      match.redAlliance.includes(overviewTeam) || match.blueAlliance.includes(overviewTeam)
    );

    // 3. Loop through the matches ONCE
    allMatches.forEach((match) => {
      const isRed = match.redAlliance.includes(overviewTeam);
      
      // Grab the actual opponent numbers (ignoring empty strings if a team was a no-show)
      const opponents = isRed ? match.blueAlliance : match.redAlliance;

      // Figure out if our team won, lost, or tied this specific match
      let outcome = "tie";
      if (isRed && match.redScore > match.blueScore) outcome = "win";
      if (isRed && match.redScore < match.blueScore) outcome = "loss";
      if (!isRed && match.blueScore > match.redScore) outcome = "win";
      if (!isRed && match.blueScore < match.redScore) outcome = "loss";

      // 4. Update the tracker for both opponents
      opponents.forEach((opp) => {
        if (!opp) return; // Skip if empty

        // If this is the first time seeing this opponent, add them to the tracker
        if (!opponentTracker[opp]) {
          opponentTracker[opp] = { team: opp, wins: 0, losses: 0, ties: 0 };
        }

        // Add the tally
        if (outcome === "win") opponentTracker[opp].wins += 1;
        else if (outcome === "loss") opponentTracker[opp].losses += 1;
        else opponentTracker[opp].ties += 1;
      });
    });

    // 5. Convert the tracker object into an array and calculate percentages safely
    const opponentsArray = Object.values(opponentTracker).map((opp) => {
      const totalMatches = opp.wins + opp.losses + opp.ties;
      // Calculate win percentage (multiply by 100 for easy display, like 100, 50, 33.3)
      const pct = totalMatches > 0 ? (opp.wins / totalMatches) * 100 : 0;
      
      return { ...opp, pct };
    });

    return opponentsArray;
  }

  // TODO: Create a list of the top 5 best matchups for the `overviewTeam`.
  // It needs to return an array of objects formatted like this:
  // [ { team: "5678X", pct: 100, wins: 3, losses: 0, ties: 1}, ... ]
  const getBestMatchups = () => {
    // Your logic here...
    const allMatchups = getMatchups();
    const sorted = allMatchups.sort((a, b) => b.pct - a.pct || b.wins - a.wins);
    return(sorted.slice(0, 5)); 
  };

  // TODO: Create a list of the top 5 worst matchups for the `overviewTeam`.
  // It needs to return an array of objects formatted exactly like the best matchups.
  const getWorstMatchups = () => {
    // Your logic here...
    const allMatchups = getMatchups();
    const sorted = allMatchups.sort((a, b) => a.pct - b.pct || b.losses - a.losses);
    //const worst = [sorted[sorted.length], sorted[sorted.length - 1], sorted[sorted.length-2],sorted[sorted.length-3], sorted[sorted.length-4]]
    //return(worst); 
    return(sorted.slice(0, 5)); 
  };

  const setOverviewTeamName = (name: string) => {
    overviewTeamName = name;
  };
  const setATeamName = (name: string) => {
    h2hTeamAName = name;
  };
  const setBTeamName = (name: string) => {
    h2hTeamBName = name;
  };

  // ==========================================
  // LINKING LOGIC TO UI
  // ==========================================
  const h2h_Total = getHeadToHeadTotalMatches();
  const h2h_teamAWins = getTeamAWins();
  const h2h_teamBWins = getTeamBWins();
  const h2h_ties = getH2hTies();
  const h2h_teamAWinPct = getWinPercentage(h2h_teamAWins, h2h_Total);
  const h2h_teamBWinPct = getWinPercentage(h2h_teamBWins, h2h_Total);

  const totalWins = getTotalWins();
  const totalLosses = getTotalLosses();
  const totalTies = getTotalTies();
  const totalWinPct = getOverallWinPct();
  const bestMatchups = getBestMatchups();
  const worstMatchups = getWorstMatchups();

  
  // ==========================================
  // USER INTERFACE (UI) RENDER
  // ==========================================
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVIGATION BAR */}
      <div style={{ backgroundColor: '#111', padding: '15px', textAlign: 'center' }}>
        <button 
          onClick={() => setCurrentPage('overview')}
          style={{ padding: '10px 20px', margin: '0 10px', cursor: 'pointer', backgroundColor: currentPage === 'overview' ? '#0070f3' : '#333', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Overview Page
        </button>
        <button 
          onClick={() => setCurrentPage('h2h')}
          style={{ padding: '10px 20px', margin: '0 10px', cursor: 'pointer', backgroundColor: currentPage === 'h2h' ? '#0070f3' : '#333', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Head-to-Head Page
        </button>
      </div>

      {/* ----------- RENDER OVERVIEW PAGE ----------- */}
      {currentPage === 'overview' && (
        <div style={{ padding: '40px', textAlign: 'center', flex: 1 }}>
          
          {/* Search Bar & Button Container */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Search Team (e.g. 333Y)" 
              value={overviewTeam}
              onChange={(e) => setOverviewTeam(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchTeamSeason(overviewTeam, 1);
              }}
              style={{ padding: '12px', fontSize: '24px', width: '40%', textAlign: 'center', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button 
              onClick={() => fetchTeamSeason(overviewTeam, 1)}
              style={{ padding: '14px 24px', fontSize: '20px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              Search
            </button>
          </div>

          <h2 style={{ color: 'gray', marginTop: '0' }}>{overviewTeam ? `${overviewTeamName}` : "Team Name"}</h2>
          
          <hr/>

          <h1 style={{ fontSize: '60px', margin: '20px 0 0 0' }}>{totalWins} - {totalLosses} - {totalTies}</h1>
          <p style={{ fontSize: '20px', marginTop: '20px', color: 'gray' }}> Wins - Losses - Ties</p>
          
          <hr/>

          <h1 style={{ fontSize: '50px', margin: '20px 0 0 0', color: '#0070f3' }}>{totalWinPct}%</h1>
          <p style={{ fontSize: '20px', marginTop: '20px', color: 'gray' }}>Overall Win Percentage</p>
          
          <br/>
          <hr/>

          {/* Top 5 Lists Section */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', gap: '50px' }}>
            
            {/* BEST MATCHUPS */}
            <div style={{ width: '300px', textAlign: 'left', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: 'green', borderBottom: '2px solid green', paddingBottom: '10px' }}>Top 5 Best Matchups</h3>
              {bestMatchups.map((m: any, index: number) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <strong>{m.team}</strong>
                  <span>{m.pct}% ({m.wins}W - {m.losses}L - {m.ties}T)</span>
                </div>
              ))}
              {bestMatchups.length === 0 && <p style={{ color: 'gray' }}>No data available.</p>}
            </div>

            {/* WORST MATCHUPS */}
            <div style={{ width: '300px', textAlign: 'left', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: 'red', borderBottom: '2px solid red', paddingBottom: '10px' }}>Top 5 Worst Matchups</h3>
              {worstMatchups.map((m: any, index: number) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <strong>{m.team}</strong>
                  <span>{m.pct}% ({m.wins}W - {m.losses}L - {m.ties}T)</span>
                </div>
              ))}
              {worstMatchups.length === 0 && <p style={{ color: 'gray' }}>No data available.</p>}
            </div>

          </div>
        </div>
      )}

      {/* ----------- RENDER HEAD-TO-HEAD PAGE ----------- */}
      {currentPage === 'h2h' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100vw' }}>
          
          {/* Centered Compare Button */}
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            <p style={{ margin: '0 0 10px 0', color: 'gray' }}>Enter both teams, then click Compare (Fetching Team A's season will find all matchups)</p>
            <button 
              onClick={() => fetchH2HMatches(teamA_Input, teamB_Input)}
              style={{ padding: '14px 40px', fontSize: '20px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              Compare Matchup
            </button>
          </div>

          <div style={{ display: 'flex', flex: 1 }}>
            {/* LEFT SIDE (Team A) */}
            <div style={{ flex: 1, borderRight: '2px solid black', padding: '40px', textAlign: 'center' }}>
              <input 
                type="text" 
                placeholder="Team A (e.g. 333Y)" 
                value={teamA_Input}
                onChange={(e) => setTeamA_Input(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchTeamSeason(teamA_Input, 2);
                }}
                style={{ padding: '12px', fontSize: '24px', width: '60%', textAlign: 'center', marginBottom: '10px' }}
              />
              <h2 style={{ color: 'gray' }}>{teamA_Input ? `${h2hTeamAName}` : "Team A"}</h2>
              
              
              <hr/>

              <h1 style={{ fontSize: '60px', margin: '20px 0 0 0' }}>{h2h_teamAWins}</h1>
              <p style={{ fontSize: '20px', marginTop: '20px' }}>Wins Against {teamB_Input || "Opponent"}</p>
              
              <hr/>

              <h1 style={{ fontSize: '40px', margin: '20px 0 0 0', color: '#0070f3' }}>{h2h_teamAWinPct}%</h1>
              <p style={{ fontSize: '20px', marginTop: '10px' }}>Win Percentage</p>
            </div>
            
            {/* RIGHT SIDE (Team B) */}
            <div style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
              <input 
                type="text" 
                placeholder="Team B (e.g. 321B)" 
                value={teamB_Input}
                onChange={(e) => setTeamB_Input(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchTeamSeason(teamB_Input,3);
                }}
                style={{ padding: '12px', fontSize: '24px', width: '60%', textAlign: 'center', marginBottom: '10px' }}
              />
              <h2 style={{ color: 'gray' }}>{teamB_Input ? `${h2hTeamBName}` : "Team B"}</h2>
              
              <hr/>

              <h1 style={{ fontSize: '60px', margin: '20px 0 0 0' }}>{h2h_teamBWins}</h1>
              <p style={{ fontSize: '20px', marginTop: '20px' }}>Wins Against {teamA_Input || "Opponent"}</p>
              
              <hr/>

              <h1 style={{ fontSize: '40px', margin: '20px 0 0 0', color: '#0070f3' }}>{h2h_teamBWinPct}%</h1>
              <p style={{ fontSize: '20px', marginTop: '10px' }}>Win Percentage</p>
            </div>
          </div>

          {/* Centered Compare Button */}
          <div style={{ textAlign: 'center', padding: '120px', backgroundColor: '#ffffff', borderBottom: '1px solid #ddd' }}><h1 style={{ fontSize: '60px', margin: '-100px 0 0 0' }}>{h2h_ties}</h1>
              <p style={{ fontSize: '20px', marginTop: '20px' }}>Ties</p>
          </div>

        </div>
      )}

    </div>
  );
}