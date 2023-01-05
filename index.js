var GeneticAlgorithmConstructor = require('geneticalgorithm')

const BYE            = 'BYE'
const numberOfTeams  = 9
const numberOfSheets = 6

const teamsArray = Array(numberOfTeams).fill().map((_, index) => index + 1) 

if ( numberOfTeams % 2 === 1) {
  teamsArray.push(BYE)
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

const sortByeToEnd = (matchA, matchB) => {
    const aHasBye = matchA.teams.includes(BYE)
    const bHasBye = matchB.teams.includes(BYE)

    if (aHasBye === bHasBye) {
        return 0
    }

    if (aHasBye) { 
        return 1
    }

    if (bHasBye) { 
        return -1
    }
}

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

const fitnessForSheet = (sheetMatchups) => {
    const flatTeams = [].concat(...sheetMatchups.map(matchup => matchup.teams))
    const teamOccurenceCounts = flatTeams.reduce((occurenceObject, element) => {
        occurenceObject[element] = ++occurenceObject[element] || 1
        return occurenceObject
    }, {})
    const occurenceArray = Object.values(teamOccurenceCounts)


    return occurenceArray.map(value => value * value).reduce((currentSum, value) => currentSum + value, 0)
}

const sortMatchesBySheet = (schedule) => {
    return schedule[0].map((_, i) => schedule.map(row => row[i])).filter(sheet => !sheet.some(matchup => matchup.teams.includes(BYE)))
}

const fitness = (schedule) => {
    const sortedSchedule = schedule.map(week => week.sort(sortByeToEnd))
    const matchesBySheet = sortMatchesBySheet(sortedSchedule)

    const weeklyFitness = matchesBySheet.map(fitnessForSheet) // weekly fitness now contains an array of each sheet's fitness score ie [ 78, 42, 42, 42 ]

    const totalFitness = weeklyFitness.reduce((sum, current) => sum + current, 0)

    return -1 * totalFitness
}

const doesABeatB = (scheduleA, scheduleB) => {
    if (scheduleA.length !== scheduleB.length) {
        throw 'schedules must be the same length to compare'
    }

    const numberOfDifference = scheduleA.reduce((result, currentWeek, weekIndex) => result + (currentWeek.reduce((weekResult, matchInA, matchIndex) => weekResult + isSameMatch(matchInA, scheduleB[weekIndex][matchIndex]), 0)), 0)

    if (numberOfDifference > 30) {
        return false
    }

    return fitness(scheduleA) >= fitness(scheduleB)
}

function shuffleArray(array) {
    const shuffled = [].concat(array)
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled
}

const mutate = (schedule) => {
    return schedule.map(week => shuffleArray(week))
}

const crossover = (scheduleA, scheduleB) => {
    if (scheduleA.length !== scheduleB.length) {
        throw 'Schedules must be same length in order to do crossover'
    }

    const crossoverWeek = Math.floor(Math.random() * scheduleA.length)

    const crossoverA = scheduleA
    const crossoverB = scheduleB

    crossoverA[crossoverWeek] = scheduleB[crossoverWeek]
    crossoverB[crossoverWeek] = scheduleA[crossoverWeek]

    return [crossoverA, crossoverB]
}

var config = {
    mutationFunction: mutate,
    crossoverFunction: crossover,
    fitnessFunction: fitness,
    doesABeatBFunction: doesABeatB,
    population: [ rrSchedule, mutate(rrSchedule), mutate(rrSchedule) ],
    populationSize: 10000
}

var geneticalgorithm = GeneticAlgorithmConstructor(config)

for(let i = 0; i < 500; i++) {
    geneticalgorithm.evolve()
}
const best = geneticalgorithm.best()

console.dir(best, {depth: null})
console.dir(sortMatchesBySheet(best), {depth: null})
console.dir(fitness(best), {depth: null})
console.log(allNecessaryMatchups.every(matchup => best.flat().some(scheduledMatchup => isSameMatch(matchup, scheduledMatchup))))
