const E_puzzle = document.querySelector('.puzzle');
const EL_cells = document.querySelectorAll('.puzzle > div');
const EL_texts = new Array(); // cell content (character)
const EL_clues_across = document.querySelector('.across > dl').children;
const EL_clues_down = document.querySelector('.down > dl').children;

// get number of cells using 'data-row' and 'data-col' attributes of '.puzzle'
const n_row = E_puzzle.dataset.row ? Number(E_puzzle.dataset.row) : 5;
const n_col = E_puzzle.dataset.col ? Number(E_puzzle.dataset.col) : 5;
const n_cells = n_row * n_col;

// correcting number of rows and columns
E_puzzle.style.gridTemplateRows = 'repeat(' + n_row + ', 1fr)';
E_puzzle.style.gridTemplateColumns = 'repeat(' + n_col + ', 1fr)';

// appending div elements to all cells
for (let cell of EL_cells) {
    const cell_content = document.createElement('div');
    cell.appendChild(cell_content);
    EL_texts.push(cell_content);
}

// check if i-th cell is black
function is_black(i) {
    return EL_cells[i].classList.contains('b');
}

// check if i-th cell is empty
function is_empty(i) {
    return !is_black(i) && EL_texts[i].innerText === '';
}

// count fillable cells
let n_fillable_cells = 0;
for (let i = 0; i < n_cells; i++) {
    if (!is_black(i)) n_fillable_cells += 1;
}

// ***************************
// appending info to each cell
// ***************************
const cell_to_across = new Array(n_cells);
const cell_to_down = new Array(n_cells);
// initializing
cell_to_across.fill(-1);
cell_to_down.fill(-1);

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
    for (let i = 0; i < EL_cells.length; i += 1) {
        cell_to_across[i] = -1;
        cell_to_down[i] = -1;

        if (is_black(i)) continue;

        // check if there is no cell to the left
        let is_leftmost_cell = false;
        if ((i % n_col === 0) || is_black(i - 1)) {
            // attach number
            const corner_number = document.createElement('h6');
            corner_number.innerText = hint_count;
            EL_cells[i].appendChild(corner_number);

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
                // attach number
                const corner_number = document.createElement('h6');
                corner_number.innerText = hint_count;
                EL_cells[i].appendChild(corner_number);

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

// manually get clue info using "data-a" and "data-d" attributes of each cell
function get_clue_info_manual() {
    let across_count = 0; // counting across clues
    let down_count = 0; // counting down clues

    for (let i = 0; i < EL_cells.length; i += 1) {
        if (is_black(i)) continue;

        // check for across clue
        if (EL_cells[i].dataset.a) {
            let across = Number(EL_cells[i].dataset.a);
            // attach number
            const corner_number = document.createElement('h6');
            corner_number.innerText = across;
            EL_cells[i].appendChild(corner_number);

            // go through all cells in the same word
            across_to_cells[across] = new Array();
            for (let j = i; (j === i || (j % n_col !== 0)) && !is_black(j); j++) {
                cell_to_across[j] = across;
                across_to_cells[across].push(j);
            }
            across_to_clue[across] = across_count;
            across_count += 1;
        }
        // check for down clue
        if (EL_cells[i].dataset.d) {
            let down = Number(EL_cells[i].dataset.d);
            // write number
            if (!EL_cells[i].dataset.a) {
                const corner_number = document.createElement('h6');
                corner_number.innerText = down;
                EL_cells[i].appendChild(corner_number);
            }

            // go through all cells in the same word
            down_to_cells[down] = new Array();
            for (let j = i; (j < n_cells) && !is_black(j); j += n_col) {
                cell_to_down[j] = down;
                down_to_cells[down].push(j);
            }
            down_to_clue[down] = down_count;
            down_count += 1;
        }
    }
}

get_clue_info_manual();

// number of clues
const clues_a = Object.keys(across_to_clue).map(val => Number(val));
const clues_d = Object.keys(down_to_clue).map(val => Number(val));
const n_clues_a = clues_a.length;
const n_clues_d = clues_d.length;

// game paused
let is_paused = false;

// ***********
// Click Event
// ***********

const ACROSS = 0, DOWN = 1;
let selected_dir = ACROSS;
let selected_cell = 0;

// resetting all cells and clues
function reset_all() {
    for (let cell of EL_cells) {
        cell.classList.remove('s');
        cell.classList.remove('o');
    }
    for (let clue of EL_clues_across) {
        clue.classList.remove('s');
    }
    for (let clue of EL_clues_down) {
        clue.classList.remove('s');
    }
}

// resetting currently selected cells and clue
function reset_selection() {
    let current_across = cell_to_across[selected_cell];
    let current_down = cell_to_down[selected_cell];

    if (selected_dir === ACROSS && current_across >= 0) {
        for (let i of across_to_cells[current_across]) {
            EL_cells[i].classList.remove('s');
            EL_cells[i].classList.remove('o');
        }
        EL_clues_across[2 * across_to_clue[current_across]].classList.remove('s'); // dt selection
        EL_clues_across[2 * across_to_clue[current_across] + 1].classList.remove('s'); // dd selection

        if (current_down >= 0) {
            EL_clues_down[2 * down_to_clue[current_down]].classList.remove('h'); // dt 'half-selection'
        }
    } else if (selected_dir === DOWN && current_down >= 0) {
        for (let i of down_to_cells[current_down]) {
            EL_cells[i].classList.remove('s');
            EL_cells[i].classList.remove('o');
        }
        EL_clues_down[2 * down_to_clue[current_down]].classList.remove('s');
        EL_clues_down[2 * down_to_clue[current_down] + 1].classList.remove('s');

        if (current_across >= 0) {
            EL_clues_across[2 * across_to_clue[current_across]].classList.remove('h');
        }
    }

    EL_cells[selected_cell].classList.remove('s');
}

// selecting the cells and clue denoted by [selected_dir, selected_hint, selected_cell]
function select() {
    let current_across = cell_to_across[selected_cell];
    let current_down = cell_to_down[selected_cell];

    // if previous selected_dir was ACROSS, maintain it.
    // if it's impossible to go DOWN, then go ACROSS.
    if ((selected_dir === ACROSS || current_down < 0) && current_across >= 0) {
        selected_dir = ACROSS;
        for (let i of across_to_cells[current_across]) {
            EL_cells[i].classList.add('o');
        }
        EL_clues_across[2 * across_to_clue[current_across]].classList.add('s');
        EL_clues_across[2 * across_to_clue[current_across] + 1].classList.add('s');
        EL_clues_across[2 * across_to_clue[current_across]].scrollIntoView();
        
        // when across hint is activated, down hint is semi-activated
        if (current_down >= 0) {
            EL_clues_down[2 * down_to_clue[current_down]].classList.add('h');
            EL_clues_down[2 * down_to_clue[current_down]].scrollIntoView();
        }
    } else if (current_down >= 0) {
        selected_dir = DOWN;
        for (let i of down_to_cells[current_down]) {
            EL_cells[i].classList.add('o');
        }
        EL_clues_down[2 * down_to_clue[current_down]].classList.add('s');
        EL_clues_down[2 * down_to_clue[current_down] + 1].classList.add('s');
        EL_clues_down[2 * down_to_clue[current_down]].scrollIntoView();

        if (current_across >= 0) {
            EL_clues_across[2 * across_to_clue[current_across]].classList.add('h');
            EL_clues_across[2 * across_to_clue[current_across]].scrollIntoView();
        }
    }

    EL_cells[selected_cell].classList.add('s');
}

// Changing direction (across / down)
function change_dir() {
    // changing to down
    if (selected_dir === ACROSS && cell_to_down[selected_cell] >= 0) {
        reset_selection();
        selected_dir = DOWN;
        select();
    } else if (selected_dir === DOWN && cell_to_across[selected_cell] >= 0) {
        reset_selection();
        selected_dir = ACROSS;
        select();
    }
}

// Changing cell (when clicking on a new cell)
function change_cell(new_cell) {
    reset_selection();
    selected_cell = new_cell;
    select();
}

// Cell click listeners
for (let i = 0; i < EL_cells.length; i += 1) {
    if (EL_cells[i].classList.contains('b')) continue;

    EL_cells[i].addEventListener('click', (e) => {
        if (is_paused) return;
        if (selected_cell === i) {
            change_dir();
        } else {
            change_cell(i);
        }
    });
}

// Clue click listeners
for (let i = 0; i < n_clues_a; i++) {
    // needs to add to both dt and dd
    for (let j = 2*i; j < 2*(i+1); j++) {
        EL_clues_across[j].addEventListener('click', (e) => {
            if (is_paused) return;
            // i-th clue has clues_a[i] as the clue number
            // if clues_a[i] is already selected, move to first letter
            let current_clue = cell_to_across[selected_cell];
            if (current_clue === clues_a[i] && selected_dir === ACROSS) {
                change_cell(across_to_cells[current_clue][0]);
                return;
            }
            // else, find the first empty letter
            for (let cell of across_to_cells[clues_a[i]]) {
                if (is_empty(cell)) {
                    reset_selection();
                    selected_dir = ACROSS;
                    selected_cell = cell;
                    select();
                    return;
                }
            }
            // if there are no empty letters, go to first letter
            reset_selection();
            selected_dir = ACROSS;
            selected_cell = across_to_cells[clues_a[i]][0];
            select();
        })
    }
}
// same thing
for (let i = 0; i < n_clues_d; i++) {
    for (let j = 2*i; j < 2*(i+1); j++) {
        EL_clues_down[j].addEventListener('click', (e) => {
            if (is_paused) return;

            let current_clue = cell_to_down[selected_cell];
            if (current_clue === clues_d[i] && selected_dir === DOWN) {
                change_cell(down_to_cells[current_clue][0]);
                return;
            }
            for (let cell of down_to_cells[clues_d[i]]) {
                if (is_empty(cell)) {
                    reset_selection();
                    selected_dir = DOWN;
                    selected_cell = cell;
                    select();
                    return;
                }
            }
            reset_selection();
            selected_dir = DOWN;
            selected_cell = down_to_cells[clues_d[i]][0];
            select();
        })
    }
}

// Initial call
while (selected_cell < n_cells) {
    if (!is_black(selected_cell)) {
        select();
        break;
    }
    selected_cell += 1;
}
if (selected_cell >= n_cells) selected_cell = -1;


// ***************
// Checking answer
// ***************

async function sha256(message) {
    if (!window.crypto) {
        window.alert('정답 체크는 https에서만 가능합니다. 주소창을 확인해주세요.')
        return message;
    }
    const msg_uint8 = new TextEncoder().encode(message);
    const hash_buffer = await window.crypto.subtle.digest('SHA-256', msg_uint8);

    // return base-16
    const hash_array = Array.from(new Uint8Array(hash_buffer));
    return hash_array.map((b) => b.toString(16).padStart(2, '0')).join('');
    // return base-64
    // const hash_string = Array.from(new Uint8Array(hash_buffer), (byte) => String.fromCodePoint(byte));
    // return btoa(hash_string.join(''));
}

function check_answer() {
    // 1. check if all cells are filled
    let filled_cells = EL_texts.reduce(
        (prev_val, elem) => prev_val + (1 ? elem.innerText !== '' : 0),
        0
    )
    if (filled_cells < n_fillable_cells) return;

    // 2. concatenate all answers
    let answer = EL_texts.map((e) => e.innerText).join('');

    // 3. digest and check
    sha256(answer).then((digest) => {
        console.log(digest);
        if (digest === E_puzzle.dataset.answer) {
            // correct
            alert('정답!');
        } else {
            // wrong
            alert('오답!');
        }
    });
}


// **************
// Keyboard event
// **************

const key_to_han = {
    // english
    'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
    'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
    'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
    'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ',
    // hangeul (wasteful but done for future extensions)
    'ㅂ': 'ㅂ', 'ㅈ': 'ㅈ', 'ㄷ': 'ㄷ', 'ㄱ': 'ㄱ', 'ㅅ': 'ㅅ', 'ㅛ': 'ㅛ', 'ㅕ': 'ㅕ', 'ㅑ': 'ㅑ', 'ㅐ': 'ㅐ', 'ㅔ': 'ㅔ',
    'ㅁ': 'ㅁ', 'ㄴ': 'ㄴ', 'ㅇ': 'ㅇ', 'ㄹ': 'ㄹ', 'ㅎ': 'ㅎ', 'ㅗ': 'ㅗ', 'ㅓ': 'ㅓ', 'ㅏ': 'ㅏ', 'ㅣ': 'ㅣ',
    'ㅋ': 'ㅋ', 'ㅌ': 'ㅌ', 'ㅊ': 'ㅊ', 'ㅍ': 'ㅍ', 'ㅠ': 'ㅠ', 'ㅜ': 'ㅜ', 'ㅡ': 'ㅡ',
    'ㅃ': 'ㅃ', 'ㅉ': 'ㅉ', 'ㄸ': 'ㄸ', 'ㄲ': 'ㄲ', 'ㅆ': 'ㅆ', 'ㅒ': 'ㅒ', 'ㅖ': 'ㅖ',
}

document.addEventListener('keydown', (e) => {
    if (is_paused) return;
    // do not handle if system keys are pressed
    if (e.altKey || e.ctrlKey || e.metaKey) {
        return;
    }
    console.log(e);

    // valid input key
    if (e.key.length === 1 && e.key in key_to_han) {
        EL_texts[selected_cell].innerText = key_to_han[e.key];

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
        check_answer();
    }

    // Backspace: erase and go previous
    else if (e.key === 'Backspace') {
        // erase current letter
        if (!is_empty(selected_cell)) {
            EL_texts[selected_cell].innerText = '';
            return;
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

        // try erasing again
        if (!is_empty(selected_cell)) {
            EL_texts[selected_cell].innerText = '';
        }
    }

    // Delete: erase and go next
    else if (e.key === 'Delete') {
        // try erasing current letter
        if (!is_empty(selected_cell)) {
            EL_texts[selected_cell].innerText = '';
            return;
        }

        // try going to next letter
        if (selected_dir === ACROSS) {
            let new_cell = selected_cell + 1;
            if (new_cell % n_col !== 0 && !is_black(new_cell)) {
                change_cell(new_cell);
            }
        } else {
            let new_cell = selected_cell + n_col;
            if (new_cell < n_cells && !is_black(new_cell)) {
                change_cell(new_cell);
            }
        }

        // try erasing again
        if (!is_empty(selected_cell)) {
            EL_texts[selected_cell].innerText = '';
        }
    }

    // arrow keys: move if correct direction, else change direction
    else if (e.key === 'ArrowLeft') {
        if (selected_dir === DOWN) { change_dir(); /* return; */ } // 'return' makes it so that only the direction changes
        let new_cell = selected_cell - 1;
        while ((new_cell + 1) % n_col !== 0) {
            if (!is_black(new_cell)) { change_cell(new_cell); break; }
            new_cell -= 1;
        }
    } else if (e.key === 'ArrowRight') {
        if (selected_dir === DOWN) { change_dir(); /* return; */ }
        let new_cell = selected_cell + 1;
        while (new_cell % n_col !== 0) {
            if (!is_black(new_cell)) { change_cell(new_cell); break; }
            new_cell += 1;
        }
    } else if (e.key === 'ArrowUp') {
        if (selected_dir === ACROSS) { change_dir(); /* return; */ }
        let new_cell = selected_cell - n_col;
        while (new_cell >= 0) {
            if (!is_black(new_cell)) { change_cell(new_cell); break; }
            new_cell -= n_col;
        }
    } else if (e.key === 'ArrowDown') {
        if (selected_dir === ACROSS) { change_dir(); /* return; */ }
        let new_cell = selected_cell + n_col;
        while (new_cell < n_cells) {
            if (!is_black(new_cell)) { change_cell(new_cell); break; }
            new_cell += n_col;
        }
    }

    // space: change between 'across' and 'down' mode
    else if (e.key === ' ') { change_dir(); }

    // enter, tab: go to next word
    else if (e.key === 'Enter' || e.key === 'Tab') {
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