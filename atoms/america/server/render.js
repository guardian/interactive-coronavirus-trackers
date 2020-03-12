import mainHTML from "./atoms/america/server/templates/main.html!text"
import filtersHTML from "./atoms/america/server/templates/filters.html!text"

export async function render() {
    return filtersHTML + mainHTML;
}
