const E_show_keyboard = document.querySelector('.show-keyboard');
const E_keyboard_container = document.querySelector('.keyboard-container');
const E_main = document.querySelector('main');

// Show / Hide keyboard
E_show_keyboard.addEventListener('click', (e) => {
    if (E_keyboard_container.hidden) {
        E_keyboard_container.hidden = false;
        E_main.style.bottom = '10.5rem';
        E_show_keyboard.innerHTML = '키보드 숨기기';
    } else {
        E_keyboard_container.hidden = true;
        E_main.style.bottom = '0';
        E_show_keyboard.innerHTML = '키보드 보기';
    }
    e.target.blur();
});

const EL_row1 = document.querySelector('.keyboard-row1').children;
const EL_row2 = document.querySelector('.keyboard-row2').children;
const EL_row3 = document.querySelector('.keyboard-row3').children;

let is_shift = false;

const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const row1_shift = ['Q', 'W', 'E', 'R', 'T', 'y', 'u', 'i', 'O', 'P'];
const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const row3 = ['', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'];

// Handle shift
const row1_text = ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'];
const row1_shift_text = ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅒ', 'ㅖ'];

function unshift() {
    is_shift = false;
    EL_row3[0].innerHTML = '⇧';
    for (let i = 0; i < 10; i++) {
        EL_row1[i].innerHTML = row1_text[i];
    }
}

EL_row3[0].addEventListener('click', (e) => {
    if (is_shift) {
        unshift();
    } else {
        is_shift = true;
        EL_row3[0].innerHTML = '⬆';
        for (let i = 0; i < 10; i++) {
            EL_row1[i].innerHTML = row1_shift_text[i];
        }
    }
});

// Row 1 buttons
for (let i = 0; i < 10; i++) {
    EL_row1[i].addEventListener('click', (e) => {
        document.dispatchEvent(
            new KeyboardEvent('keydown', { key: (is_shift ? row1_shift[i] : row1[i]) })
        );
        if (is_shift) unshift();
    });
}
// Row 2 buttons
for (let i = 0; i < 9; i++) {
    EL_row2[i].addEventListener('click', (e) => {
        document.dispatchEvent(
            new KeyboardEvent('keydown', { key: row2[i] })
        );
        if (is_shift) unshift();
    });
}
// Row 3 buttons (except shift)
for (let i = 1; i < 9; i++) {
    EL_row3[i].addEventListener('click', (e) => {
        document.dispatchEvent(
            new KeyboardEvent('keydown', { key: row3[i] })
        );
        if (is_shift) unshift();
    });
}
