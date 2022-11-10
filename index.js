const numberOfTeams  = 9 
const numberOfSheets = 6

const teamsArray = Array(numberOfTeams).fill().map((_, index) => index + 1) 

if ( numberOfTeams % 2 === 1) {
  teamsArray.push('BYE')
}

const allNecessaryMatchups = [].concat(...teamsArray.map( 
  (v, i) => teamsArray.slice(i+1).map( w => { return { teams: [v, w] } }))
)

const matchesPerWeek = teamsArray.length / 2
const weeksNeeded    = allNecessaryMatchups.length / matchesPerWeek

const isSameMatch = (matchA, matchB) => matchA.teams.every(team => matchB.teams.includes(team))
const matchHasAnySameTeam = (matchA, matchB) => matchA.teams.some(team => matchB.teams.includes(team))
const weekHasTeamPlaying = (week, match) => week.some(matchInWeek => matchHasAnySameTeam(match, matchInWeek))

const arrayRotate = (array, count) => array.slice(count, array.length).concat(array.slice(0, count))

const rrSchedule = new Array(weeksNeeded).fill([]).map((week, weekIndex) => {
    week.length = teamsArray.length / 2
    week.fill({})

    const teamsForWeek = [].concat(teamsArray)
    const pivotTeam = teamsForWeek.shift()
    const rotatedTeams = arrayRotate(teamsForWeek, weekIndex)

    return week.map((_, matchIndex) => {
        const firstTeam = matchIndex === 0 ? pivotTeam : rotatedTeams[matchIndex - 1]
        const secondTeam = rotatedTeams[rotatedTeams.length - 1 - matchIndex]

        return { teams: [firstTeam, secondTeam] }
    })
})

const isScheduleComplete = allNecessaryMatchups.every(matchup => rrSchedule.flat().some(scheduledMatchup => isSameMatch(matchup, scheduledMatchup)))

if (!isScheduleComplete) {
    console.log("Schedule is not complete! Not all round robin matchups have been scheduled!")
    process.exit(1)
}

rrSchedule.forEach((week, weekNumber) => console.log(`On week ${weekNumber + 1} the matchups are ${JSON.stringify(week)}`))


const fitness = (schedule) => {
    const transposed = schedule[0].map((_, i) => schedule.map(row => row[i]))
    const mapped = transposed.map(sheet => sheet.
    console.log(transposed)
}

fitness(rrSchedule)
