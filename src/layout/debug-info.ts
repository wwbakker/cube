const getDebugInfoElement = () =>
  document.getElementById("debug-info") as HTMLElement

const elementByKey: Record<string, HTMLElement> = {}

export const debug = (key: string, value: any): void => {
  if (!elementByKey[key]) {
    elementByKey[key] = createDebugElement(key)
    getDebugInfoElement().appendChild(elementByKey[key])
  }
  elementByKey[key].textContent = formatValue(value)
}

const formatValue = (value: any): string => {
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  if (value === undefined) {
    return "undefined"
  }
  if (value === null) {
    return "null"
  }
  return value.toString()
}

const createDebugElement = (key: string) => {
  const outerElement = document.createElement("div")
  const keyElement = document.createElement("strong")
  const valueElement = document.createElement("span")
  keyElement.textContent = `${key}: `
  outerElement.appendChild(keyElement)
  outerElement.appendChild(valueElement)
  getDebugInfoElement().appendChild(outerElement)
  return valueElement
}
