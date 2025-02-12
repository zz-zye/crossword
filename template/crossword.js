const E_puzzle = document.querySelector('.puzzle');
const E_cells = document.querySelectorAll('.puzzle > div');
const E_texts = new Array(); // cell content (character)
const E_clues_across = document.querySelector('.across > dl').children;
const E_clues_down = document.querySelector('.down > dl').children;

// check if i-th cell is black
function is_black(i) {
    return E_cells[i].classList.contains('b');
}

// get number of cells using 'data-row' and 'data-col' attributes of '.puzzle'
const n_row = E_puzzle.dataset.row ? Number(E_puzzle.dataset.row) : 5;
const n_col = E_puzzle.dataset.col ? Number(E_puzzle.dataset.col) : 5;
const n_cells = n_row * n_col;

// correcting number of rows and columns
E_puzzle.style.gridTemplateRows = 'repeat(' + n_row + ', 1fr)';
E_puzzle.style.gridTemplateColumns = 'repeat(' + n_col + ', 1fr)';

// appending div elements to all cells
for (let cell of E_cells) {
    const cell_content = document.createElement('div');
    cell.appendChild(cell_content);
    E_texts.push(cell_content);
}

// check if i-th cell is empty
function is_empty(i) {
    return !is_black(i) && E_texts[i].innerText === '';
}

// ***************************
// appending info to each cell
// ***************************
const cell_to_across = new Array(n_cells);
const cell_to_down = new Array(n_cells);
const across_to_cells = {};
const down_to_cells = {};
const across_to_clue = {};
const down_to_clue = {};

// automatically getting info
// every possible across / down combinations are made into clues
function get_clue_info_auto() {
    let hint_count = 1; // counting hint numbers
    let across_count = 0; // counting across clues
    let down_count = 0; // counting down clues
    for (let i = 0; i < E_cells.length; i += 1) {
        cell_to_across[i] = -1;
        cell_to_down[i] = -1;

        if (is_black(i)) continue;

        // check if there is no cell to the left
        let is_leftmost_cell = false;
        if ((i % n_col === 0) || is_black(i - 1)) {
            cell_to_across[i] = hint_count;
            hint_count += 1;
            is_leftmost_cell = true;

            across_to_clue[cell_to_across[i]] = across_count;
            across_to_cells[cell_to_across[i]] = [i];
            across_count += 1;
        } else {
            cell_to_across[i] = cell_to_across[i - 1];
            across_to_cells[cell_to_across[i]].push(i);
        }

        // check if there is no cell above
        if ((i - n_col < 0) || is_black(i - n_col)) {
            if (is_leftmost_cell) {
                cell_to_down[i] = cell_to_across[i];
            } else {
                cell_to_down[i] = hint_count;
                hint_count += 1;
            }

            down_to_clue[cell_to_down[i]] = down_count;
            down_to_cells[cell_to_down[i]] = [i];
            down_count += 1;
        } else {
            cell_to_down[i] = cell_to_down[i - n_col];
            down_to_cells[cell_to_down[i]].push(i);
        }
    }
}

get_clue_info_auto();

// manually get clue info using "data-a" and "data-d" attributes of each cell
function get_clue_info_manual() {

}

// number of clues
const clues_a = Object.keys(across_to_clue).map(val => Number(val));
const clues_d = Object.keys(down_to_clue).map(val => Number(val));
const n_clues_a = clues_a.length;
const n_clues_d = clues_d.length;

// ***********
// Click Event
// ***********

const ACROSS = 0, DOWN = 1;
let selected_dir = ACROSS;
let selected_cell = 0;

// resetting all cells and clues
function reset_all() {
    for (let cell of E_cells) {
        cell.classList.remove('s');
        cell.classList.remove('o');
    }
    for (let clue of E_clues_across) {
        clue.classList.remove('s');
    }
    for (let clue of E_clues_down) {
        clue.classList.remove('s');
    }
}

// resetting currently selected cells and clue
function reset_selection() {
    let current_across = cell_to_across[selected_cell];
    let current_down = cell_to_down[selected_cell];

    if (selected_dir === ACROSS) {
        for (let i of across_to_cells[current_across]) {
            E_cells[i].classList.remove('s');
            E_cells[i].classList.remove('o');
        }
    } else {
        for (let i of down_to_cells[current_down]) {
            E_cells[i].classList.remove('s');
            E_cells[i].classList.remove('o');
        }
    }

    E_clues_across[2 * across_to_clue[current_across]].classList.remove('s'); // dt
    E_clues_across[2 * across_to_clue[current_across] + 1].classList.remove('s'); // dd
    E_clues_down[2 * down_to_clue[current_down]].classList.remove('s');
    E_clues_down[2 * down_to_clue[current_down] + 1].classList.remove('s');
}

// selecting the cells and clue denoted by [selected_dir, selected_hint, selected_cell]
function select() {
    let current_across = cell_to_across[selected_cell];
    let current_down = cell_to_down[selected_cell];

    if (selected_dir === ACROSS) {
        for (let i of across_to_cells[current_across]) {
            E_cells[i].classList.add('o');
        }
        E_clues_across[2 * across_to_clue[current_across]].classList.add('s');
        E_clues_across[2 * across_to_clue[current_across] + 1].classList.add('s');
        E_clues_across[2 * across_to_clue[current_across]].scrollIntoView();
        // when across hint is activated, down hint is semi-activated
        E_clues_down[2 * down_to_clue[current_down]].classList.add('s');
        E_clues_down[2 * down_to_clue[current_down]].scrollIntoView();
    } else {
        for (let i of down_to_cells[current_down]) {
            E_cells[i].classList.add('o');
        }
        E_clues_down[2 * down_to_clue[current_down]].classList.add('s');
        E_clues_down[2 * down_to_clue[current_down] + 1].classList.add('s');
        E_clues_down[2 * down_to_clue[current_down]].scrollIntoView();

        E_clues_across[2 * across_to_clue[current_across]].classList.add('s');
        E_clues_across[2 * across_to_clue[current_across]].scrollIntoView();
    }
    E_cells[selected_cell].classList.add('s');
}

function change_dir() {
    reset_selection();
    selected_dir = 1 - selected_dir; // 1 -> 0, 0 -> 1
    select();
}

function change_cell(new_cell) {
    reset_selection();
    selected_cell = new_cell;
    select();
}

for (let i = 0; i < E_cells.length; i += 1) {
    if (E_cells[i].classList.contains('b')) continue;

    E_cells[i].addEventListener('click', (e) => {
        if (selected_cell === i) {
            change_dir();
        } else {
            change_cell(i);
        }
    });
}

// Initial call
select();


// **************
// Keyboard event
// **************
const key_to_han = {
    'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
    'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
    'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
    'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ'
}

window.addEventListener('keydown', (e) => {
    // valid input key
    if (e.key.length === 1 && e.key in key_to_han) {
        E_texts[selected_cell].innerText = key_to_han[e.key];

        // moving to next letter
        if (selected_dir === 0) { // across
            let new_cell = selected_cell + 1;
            while (new_cell % n_col !== 0 && !is_black(new_cell)) {
                if (is_empty(new_cell)) {
                    change_cell(new_cell);
                    break;
                }
                new_cell += 1;
            }
        } else {
            let new_cell = selected_cell + n_col;
            while (new_cell < n_cells && !is_black(new_cell)) {
                if (is_empty(new_cell)) {
                    change_cell(new_cell);
                    break;
                }
                new_cell += n_col;
            }
        }
    }

    // backspace, delete: erase
    else if (e.code === 'Backspace' || e.code === 'Delete') {
        // erase current letter
        if (!is_empty(selected_cell)) {
            E_texts[selected_cell].innerText = '';
        }

        // try going to previous letter
        if (selected_dir === ACROSS) {
            let new_cell = selected_cell - 1;
            if ((new_cell + 1) % n_col !== 0 && !is_black(new_cell)) {
                change_cell(new_cell);
            }
        } else {
            let new_cell = selected_cell - n_col;
            if (new_cell >= 0 && !is_black(new_cell)) {
                change_cell(new_cell);
            }
        }
    }

    // arrow keys: move if correct direction, else change direction
    if (e.code === 'ArrowLeft') {
        if (selected_dir === DOWN) { change_dir(); /* return; */ } // 'return' makes it so that only the direction changes
        let new_cell = selected_cell - 1;
        while ((new_cell + 1) % n_col !== 0) {
            if (!is_black(new_cell)) { change_cell(new_cell); break; }
            new_cell -= 1;
        }
    } else if (e.code === 'ArrowRight') {
        if (selected_dir === DOWN) { change_dir(); /* return; */ }
        let new_cell = selected_cell + 1;
        while (new_cell % n_col !== 0) {
            if (!is_black(new_cell)) { change_cell(new_cell); break; }
            new_cell += 1;
        }
    } else if (e.code === 'ArrowUp') {
        if (selected_dir === ACROSS) { change_dir(); /* return; */ }
        let new_cell = selected_cell - n_col;
        while (new_cell >= 0) {
            if (!is_black(new_cell)) { change_cell(new_cell); break; }
            new_cell -= n_col;
        }
    } else if (e.code === 'ArrowDown') {
        if (selected_dir === ACROSS) { change_dir(); /* return; */ }
        let new_cell = selected_cell + n_col;
        while (new_cell < n_cells) {
            if (!is_black(new_cell)) { change_cell(new_cell); break; }
            new_cell += n_col;
        }
    }

    // space: change between 'across' and 'down' mode
    else if (e.code === 'Space') { change_dir(); }

    // enter, tab: go to next word
    else if (e.code === 'Enter' || e.code === 'Tab') {
        let current_clue = 0;
        if (selected_dir === ACROSS) {
            current_clue = clues_a.indexOf(cell_to_across[selected_cell]);
        } else {
            current_clue = clues_d.indexOf(cell_to_down[selected_cell]) + n_clues_a;
        }

        // go through every clue
        for (let i = 1; i < n_clues_a + n_clues_d; i++) {
            let new_clue = (current_clue + i) % (n_clues_a + n_clues_d);

            if (new_clue < n_clues_a) {
                for (let cell of across_to_cells[clues_a[new_clue]]) {
                    if (is_empty(cell)) {
                        reset_selection();
                        selected_cell = cell;
                        selected_dir = ACROSS;
                        select();
                        return;
                    }
                }
            } else {
                for (let cell of down_to_cells[clues_d[new_clue - n_clues_a]]) {
                    if (is_empty(cell)) {
                        reset_selection();
                        selected_cell = cell;
                        selected_dir = DOWN;
                        select();
                        return;
                    }
                }
            }
        }
    }
});