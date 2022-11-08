const numberOfTeams  = 13
const numberOfSheets = 6

const teamsArray = Array(numberOfTeams).fill().map((_, index) => index + 1) 

if ( numberOfTeams % 2 === 1) {
  teamsArray.push('BYE')
}

const matchUps = [].concat(...teamsArray.map( 
  (v, i) => teamsArray.slice(i+1).map( w => { return { teams: [v, w] } }))
)

// matchups now has all the matchups we need to run for a full round robin
// the number of weeks we need is equal to the number of matchups to play
// divided by the number of matchups that can be played per week.

// the number of matches that can be played per week is the min of half
// the numer of teams (each team plays a matchup every week) or the number
// of sheets available to play matches on

const matchesPerWeek = Math.min(Math.ceil(numberOfTeams / 2), numberOfSheets)
const weeksNeeded    = matchUps.length / matchesPerWeek

const isSameMatch = (matchA, matchB) => matchA.teams.every(team => matchB.teams.includes(team))
const matchHasAnySameTeam = (matchA, matchB) => matchA.teams.some(team => matchB.teams.includes(team))
const weekHasTeamPlaying = (week, match) => week.some(matchInWeek => matchHasAnySameTeam(match, matchInWeek))

const arrayRotate = (array, count) => array.slice(count, array.length).concat(array.slice(0, count))

// now, for every week, pick from the list of unplayed matches, making sure that we don't double book a team

const createWeek = (playedMatches, allPossibleMatches, matchesPerWeek) => {
    const availableMatchesThisWeek = allPossibleMatches.filter(match => !playedMatches.some(playedMatch => isSameMatch(match, playedMatch)))

    const week = []

    while(week.length < matchesPerWeek) {
        const candidateMatch = availableMatchesThisWeek.find(match => !weekHasTeamPlaying(week, match))
        const firstMatch = week[0]

        if (!candidateMatch) {
            week.shift()
            const secondCandidateMatch = availableMatchesThisWeek.find(match => !weekHasTeamPlaying(week, match) && !isSameMatch(match, firstMatch))
            week.push(secondCandidateMatch)
            continue
        }

        week.push(candidateMatch)
    }

    return week
}

const leagueSchedule = []

for(let i = 0; i < weeksNeeded; i++) {
    leagueSchedule.push(createWeek(leagueSchedule.flat(), matchUps, matchesPerWeek))
}

const isScheduleComplete = matchUps.every(matchup => leagueSchedule.flat().some(scheduledMatchup => isSameMatch(matchup, scheduledMatchup)))

if (!isScheduleComplete) {
    console.log("Schedule is not complete! Not all round robin matchups have been scheduled!")
    process.exit(1)
}

leagueSchedule.forEach((week, weekNumber) => console.log(`On week ${weekNumber + 1} the matchups are ${JSON.stringify(week)}`))
