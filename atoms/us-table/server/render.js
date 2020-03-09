import mainHTML from "./atoms/default/server/templates/main.html!text"

export async function render() {
    return `<div class='co-table-container'>
    <table class='co-table'>
    <thead>
        <tr>
            <td class='co-table-state'>State</td>
            <td class='co-table-cases'>Confirmed cases</td>
        </tr>
    </thead>
    <tbody class='co-tbody'></tbody>
    </table>
    <p class='co-source'>Source: Johns Hopkins University</p>
    </div>`
}