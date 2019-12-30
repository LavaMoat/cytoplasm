
const adjectives = [
  'pretty',
  'large',
  'big',
  'small',
  'tall',
  'short',
  'long',
  'handsome',
  'plain',
  'quaint',
  'clean',
  'elegant',
  'easy',
  'angry',
  'crazy',
  'helpful',
  'mushy',
  'odd',
  'unsightly',
  'adorable',
  'important',
  'inexpensive',
  'cheap',
  'expensive',
  'fancy'
]
const colors = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange'
]
const nouns = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard'
]

let nextId = 1

module.exports = {
  createDeepData,
  createFlatData,
  doManyTimes,
  randomPhrase
}

function createDeepData (count) {
  return doManyTimes(count, () => {
    const obj = createObj()
    obj.a = createObj()
    obj.a.b = createObj()
    obj.a.b.c = createObj()
    return obj
  })
}

function createObj () {
  return {
    id: nextId++,
    label: randomPhrase(),
    className: randomPhrase()
  }
}

function createFlatData (count) {
  return doManyTimes(count, createObj)
}

function doManyTimes (count, fn) {
  return new Array(count).fill().map(fn)
}

function random (max) {
  return Math.floor(Math.random() * max)
}

function randomFrom (array) {
  return array[random(array.length)]
}

function randomPhrase () {
  return `${randomFrom(adjectives)} ${randomFrom(colors)} ${randomFrom(nouns)}`
}
