(function () {
  const term = document.getElementById('term');
  const output = document.getElementById('output');
  const promptLine = document.getElementById('prompt-line');
  const inputSpan = document.getElementById('input');

  const PROMPT_USER = 'mdelledonne@portfolio';
  const PROMPT_LOC = '~';

  let lang = localStorage.getItem('cv_lang') || 'es';
  let history = [];
  let historyIdx = 0;
  let currentInput = '';
  let busy = false;

  const i18n = {
    es: {
      langSet: 'Idioma cambiado a español.',
      notFound: (cmd) => `${cmd}: comando no encontrado. Probá 'help'.`,
      help: [
        ['help',       'lista de comandos'],
        ['whoami',     'quién soy'],
        ['about',      'sobre mí'],
        ['experience', 'experiencia laboral'],
        ['skills',     'stack y aptitudes'],
        ['projects',   'proyectos recientes'],
        ['education',  'formación'],
        ['contact',    'datos de contacto'],
        ['cv',         'descargar CV (PDF)'],
        ['ls',         'listar archivos'],
        ['cat <file>', 'leer archivo'],
        ['neofetch',   'info del sistema'],
        ['play guitar','easter egg 🎸'],
        ['lang en|es', 'cambiar idioma'],
        ['clear',      'limpiar pantalla'],
      ],
      whoami: 'Marcelo Ignacio Delledonne — Desarrollador Full-Stack',
      about: [
        'Hola! Soy Marcelo, desarrollador full-stack con base en La Plata, Argentina.',
        '',
        'Más de 10 años combinando análisis, desarrollo web (PHP, JavaScript, Python)',
        'y administración de sistemas. Trabajo en FEMEBA y como freelance, con varios',
        'proyectos para el sector público nacional.',
        '',
        'Cuando no estoy programando, toco la guitarra.',
      ],
      expTitle: 'EXPERIENCIA LABORAL',
      experience: [
        { role: 'Análisis y Desarrollo', org: 'FEMEBA', loc: 'La Plata', period: 'ene 2022 — presente', desc: [
          'Análisis y desarrollo de sistemas y nuevas tecnologías.',
          'Mantenimiento de sistemas en producción y soporte técnico en sitio.',
        ]},
        { role: 'Desarrollador Web Full-Stack', org: 'Freelance', loc: 'La Plata', period: 'jul 2013 — presente', desc: [
          'Desarrollo de aplicaciones web con PHP (Symfony, Laravel, CodeIgniter)',
          'y JavaScript. Trabajo directo con clientes, end-to-end.',
        ]},
        { role: 'Help Desk', org: 'FEMEBA', loc: 'La Plata', period: 'jul 2013 — dic 2021', desc: [
          'Soporte técnico telefónico y QA/testing del sistema FEMEBA ONLINE 2.',
        ]},
        { role: 'Desarrollo Web', org: 'TRAFTECNO', loc: 'La Plata', period: 'mar 2014 — ene 2019', desc: [
          'Desarrollo de software, incluyendo proyectos de tecnología blockchain',
          '(Bitcoin, NEM).',
        ]},
      ],
      skillsTitle: 'STACK',
      skills: [
        ['Lenguajes',    'PHP (Symfony · Laravel · CodeIgniter), JavaScript (Angular · jQuery), Python, Java, Smalltalk'],
        ['Bases de datos', 'MySQL · MariaDB · PostgreSQL · SQL'],
        ['Sistemas',     'Linux · Windows · macOS'],
        ['Redes',        'CCNA Cisco · administración de redes LAN/WAN'],
        ['Herramientas', 'Git'],
        ['Idiomas',      'Español (nativo) · Inglés (medio / professional working)'],
      ],
      projTitle: 'PROYECTOS RECIENTES',
      projects: [
        { year: '2025-2026', name: 'FlowSignals — señales astrales personalizadas por Telegram', org: 'Freelance · carta natal + tránsitos del día', url: 'https://flowsignals.app' },
        { year: '2023-2024', name: 'PIIT — Plataforma Inteligente de Datos Turísticos', org: 'Subsec. de Turismo de la Nación' },
        { year: '2023',      name: 'DEST + PUNA — Estadísticos Subnacionales y Padrón Único Nacional de Alojamientos', org: 'Min. de Turismo de la Nación' },
        { year: '2022',      name: 'SIEC — Plataforma de Residuos No Peligrosos Valorizados', org: 'Min. de Desarrollo Productivo' },
        { year: '2021',      name: 'Tablero de Gestión de Iniciativas', org: 'Min. de Desarrollo Productivo' },
      ],
      eduTitle: 'FORMACIÓN',
      education: [
        { what: 'Licenciatura en Sistemas', where: 'Facultad de Informática · UNLP', period: '2012 — actualidad', extra: 'Ayudante ad-honorem cátedra Algoritmos, Datos y Programas (2013-2014).' },
        { what: 'Analista Programador Universitario', where: 'Facultad de Informática · UNLP', period: '2012 — 2016' },
        { what: 'CCNA — Cisco Certified Network Associate', where: 'CESPI · Cisco Networking Academy · UNLP', period: '2014 — 2015' },
        { what: 'Profesorado en Música (orientación Guitarra)', where: 'Facultad de Bellas Artes · UNLP', period: '2003 — 2008' },
        { what: 'Bachiller Técnico en Equipos e Instalaciones Electromecánicas', where: 'EET N°1, Roque Pérez', period: '1998 — 2003' },
      ],
      contactTitle: 'CONTACTO',
      cvDownload: 'Descargando CV (PDF)…',
      noFile: (f) => `cat: ${f}: No existe el archivo o el directorio`,
      missing: 'cat: falta el operando archivo',
      cleared: '',
      langUsage: "uso: lang <es|en>",
      sudo: 'lo siento, no estás en el archivo sudoers. Este incidente será reportado.',
      bye: '¿Salir? Imposible, ya estás dentro de la terminal 😉',
      guitar: '♪ Em — D — C — B7  ♪  (Asturias, Albéniz)',
    },
    en: {
      langSet: 'Language switched to English.',
      notFound: (cmd) => `${cmd}: command not found. Try 'help'.`,
      help: [
        ['help',       'list commands'],
        ['whoami',     'who I am'],
        ['about',      'about me'],
        ['experience', 'work experience'],
        ['skills',     'tech stack'],
        ['projects',   'recent projects'],
        ['education',  'education'],
        ['contact',    'contact info'],
        ['cv',         'download CV (PDF)'],
        ['ls',         'list files'],
        ['cat <file>', 'read a file'],
        ['neofetch',   'system info'],
        ['play guitar','easter egg 🎸'],
        ['lang en|es', 'switch language'],
        ['clear',      'clear screen'],
      ],
      whoami: 'Marcelo Ignacio Delledonne — Full-Stack Developer',
      about: [
        "Hi! I'm Marcelo, a full-stack developer based in La Plata, Argentina.",
        '',
        '10+ years mixing analysis, web development (PHP, JavaScript, Python)',
        'and systems administration. I work at FEMEBA and as a freelancer,',
        'with several projects for the Argentine federal government.',
        '',
        "When I'm not coding, I play the guitar.",
      ],
      expTitle: 'WORK EXPERIENCE',
      experience: [
        { role: 'Analysis and Development', org: 'FEMEBA', loc: 'La Plata', period: 'Jan 2022 — present', desc: [
          'Systems analysis and development of new technologies.',
          'Production system maintenance and on-site technical support.',
        ]},
        { role: 'Full-Stack Web Developer', org: 'Freelance', loc: 'La Plata', period: 'Jul 2013 — present', desc: [
          'Web application development in PHP (Symfony, Laravel, CodeIgniter)',
          'and JavaScript. End-to-end work directly with clients.',
        ]},
        { role: 'Help Desk', org: 'FEMEBA', loc: 'La Plata', period: 'Jul 2013 — Dec 2021', desc: [
          'Phone tech support and QA/testing of FEMEBA ONLINE 2.',
        ]},
        { role: 'Web Developer', org: 'TRAFTECNO', loc: 'La Plata', period: 'Mar 2014 — Jan 2019', desc: [
          'Software development including blockchain projects (Bitcoin, NEM).',
        ]},
      ],
      skillsTitle: 'STACK',
      skills: [
        ['Languages',  'PHP (Symfony · Laravel · CodeIgniter), JavaScript (Angular · jQuery), Python, Java, Smalltalk'],
        ['Databases',  'MySQL · MariaDB · PostgreSQL · SQL'],
        ['Systems',    'Linux · Windows · macOS'],
        ['Networking', 'CCNA Cisco · LAN/WAN administration'],
        ['Tools',      'Git'],
        ['Languages (spoken)', 'Spanish (native) · English (professional working)'],
      ],
      projTitle: 'RECENT PROJECTS',
      projects: [
        { year: '2025-2026', name: 'FlowSignals — personalized astrological signals via Telegram', org: 'Freelance · natal chart + daily transits', url: 'https://flowsignals.app' },
        { year: '2023-2024', name: 'PIIT — Smart Tourism Data Platform', org: 'National Tourism Office' },
        { year: '2023',      name: 'DEST + PUNA — Subnational Tourism Statistics & National Lodging Registry', org: 'Ministry of Tourism' },
        { year: '2022',      name: 'SIEC — Valorized Non-Hazardous Waste Platform', org: 'Ministry of Productive Development' },
        { year: '2021',      name: 'Initiatives Management Dashboard', org: 'Ministry of Productive Development' },
      ],
      eduTitle: 'EDUCATION',
      education: [
        { what: 'B.Sc. in Computer Systems', where: 'School of Informatics · UNLP', period: '2012 — present', extra: 'Teaching Assistant (ad-honorem) — Algorithms, Data and Programs (2013-2014).' },
        { what: 'University Programming Analyst', where: 'School of Informatics · UNLP', period: '2012 — 2016' },
        { what: 'CCNA — Cisco Certified Network Associate', where: 'CESPI · Cisco Networking Academy · UNLP', period: '2014 — 2015' },
        { what: 'Music Teaching Degree (Guitar)', where: 'School of Fine Arts · UNLP', period: '2003 — 2008' },
        { what: 'Technical High School — Electromechanics', where: 'EET N°1, Roque Pérez', period: '1998 — 2003' },
      ],
      contactTitle: 'CONTACT',
      cvDownload: 'Downloading CV (PDF)…',
      noFile: (f) => `cat: ${f}: No such file or directory`,
      missing: 'cat: missing file operand',
      cleared: '',
      langUsage: 'usage: lang <es|en>',
      sudo: "Sorry, you're not in the sudoers file. This incident will be reported.",
      bye: 'Quit? Impossible, you are already inside the terminal 😉',
      guitar: '♪ Em — D — C — B7  ♪  (Asturias, Albéniz)',
    },
  };

  const files = ['about.md', 'experience.md', 'skills.md', 'projects.md', 'education.md', 'contact.md', 'cv.pdf'];
  const fileMap = {
    'about.md':      () => commands.about(),
    'experience.md': () => commands.experience(),
    'skills.md':     () => commands.skills(),
    'projects.md':   () => commands.projects(),
    'education.md':  () => commands.education(),
    'contact.md':    () => commands.contact(),
    'cv.pdf':        () => commands.cv(),
  };

  function t() { return i18n[lang]; }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function append(html, cls) {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = html;
    output.appendChild(div);
    scrollDown();
    return div;
  }

  function appendBlock(htmlLines) {
    const wrap = document.createElement('div');
    wrap.className = 'output-block';
    wrap.innerHTML = htmlLines.join('\n');
    output.appendChild(wrap);
    scrollDown();
  }

  function appendEcho(cmd) {
    const html = `<span class="Prompt__user">${PROMPT_USER}</span><span class="Prompt__colon">:</span><span class="Prompt__location">${PROMPT_LOC}</span><span class="Prompt__dollar">$</span> <span class="Prompt__cmd">${escapeHtml(cmd)}</span>`;
    append(html, 'Terminal__Prompt cmd-echo');
  }

  function scrollDown() {
    term.scrollTop = term.scrollHeight;
  }

  function pad(s, n) {
    s = String(s);
    return s.length >= n ? s : s + ' '.repeat(n - s.length);
  }

  // ---------- Commands ----------
  const commands = {
    help() {
      const rows = t().help.map(([cmd, desc]) =>
        `  <span class="color-key">${pad(cmd, 14)}</span><span class="color-muted">${escapeHtml(desc)}</span>`
      );
      appendBlock(rows);
    },

    whoami() {
      append(`<span class="color-success">${escapeHtml(t().whoami)}</span>`, 'output-block');
    },

    about() {
      const lines = t().about.map((l) => `<span class="color-val">${escapeHtml(l)}</span>`);
      appendBlock(lines);
    },

    experience() {
      const lines = [`<span class="color-key">${t().expTitle}</span>`, ''];
      for (const e of t().experience) {
        lines.push(
          `  <span class="color-success">${escapeHtml(e.role)}</span> <span class="color-muted">@</span> <span class="color-sub">${escapeHtml(e.org)}</span> <span class="color-muted">· ${escapeHtml(e.loc)}</span>`,
          `    <span class="color-muted">${escapeHtml(e.period)}</span>`
        );
        const descLines = Array.isArray(e.desc) ? e.desc : [e.desc];
        for (const d of descLines) {
          lines.push(`    <span class="color-val">${escapeHtml(d)}</span>`);
        }
        lines.push('');
      }
      appendBlock(lines);
    },

    skills() {
      const lines = [`<span class="color-key">${t().skillsTitle}</span>`, ''];
      for (const [k, v] of t().skills) {
        lines.push(`  <span class="color-sub">${pad(escapeHtml(k), 22)}</span> <span class="color-val">${escapeHtml(v)}</span>`);
      }
      appendBlock(lines);
    },

    projects() {
      const lines = [`<span class="color-key">${t().projTitle}</span>`, ''];
      for (const p of t().projects) {
        lines.push(
          `  <span class="color-muted">[${escapeHtml(p.year)}]</span> <span class="color-success">${escapeHtml(p.name)}</span>`,
          `    <span class="color-sub">${escapeHtml(p.org)}</span>`
        );
        if (p.url) {
          const display = p.url.replace(/^https?:\/\//, '');
          lines.push(`    <a class="term-link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${escapeHtml(display)}</a>`);
        }
        lines.push('');
      }
      appendBlock(lines);
    },

    education() {
      const lines = [`<span class="color-key">${t().eduTitle}</span>`, ''];
      for (const e of t().education) {
        lines.push(
          `  <span class="color-success">${escapeHtml(e.what)}</span>`,
          `    <span class="color-sub">${escapeHtml(e.where)}</span> <span class="color-muted">· ${escapeHtml(e.period)}</span>`
        );
        if (e.extra) lines.push(`    <span class="color-muted">${escapeHtml(e.extra)}</span>`);
        lines.push('');
      }
      appendBlock(lines);
    },

    contact() {
      const lines = [
        `<span class="color-key">${t().contactTitle}</span>`,
        '',
        `  <span class="color-sub">${pad('email', 12)}</span> <a class="term-link" href="mailto:mdelledonne224@gmail.com">mdelledonne224@gmail.com</a>`,
        `  <span class="color-sub">${pad('linkedin', 12)}</span> <a class="term-link" href="https://www.linkedin.com/in/marcelo-delledonne-38452ab9/" target="_blank" rel="noopener">linkedin.com/in/marcelo-delledonne</a>`,
        `  <span class="color-sub">${pad('phone', 12)}</span> <span class="color-val">(+54) 221 545 8808</span>`,
        `  <span class="color-sub">${pad('location', 12)}</span> <span class="color-val">La Plata, Buenos Aires, Argentina</span>`,
      ];
      appendBlock(lines);
    },

    cv() {
      append(`<span class="color-info">${escapeHtml(t().cvDownload)}</span>`, 'output-block');
      const a = document.createElement('a');
      a.href = './cv.pdf';
      a.download = 'Marcelo_Delledonne_CV.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    ls() {
      const cols = files.map((f) => {
        const cls = f.endsWith('.pdf') ? 'color-error' : (f.endsWith('.md') ? 'color-success' : 'color-val');
        return `<span class="${cls}">${escapeHtml(f)}</span>`;
      });
      append(cols.join('  '), 'output-block');
    },

    cat(arg) {
      if (!arg) return append(`<span class="color-error">${escapeHtml(t().missing)}</span>`, 'output-block');
      const fn = fileMap[arg];
      if (!fn) return append(`<span class="color-error">${escapeHtml(t().noFile(arg))}</span>`, 'output-block');
      fn();
    },

    clear() {
      output.innerHTML = '';
    },

    neofetch() {
      const isEs = lang === 'es';
      const L = isEs
        ? { os:'OS', role:'Rol', stack:'Stack', fw:'Frameworks', db:'DB', net:'Redes', tools:'Tools', langs:'Idiomas', music:'Música', uptime:'Uptime', status:'Status' }
        : { os:'OS', role:'Role', stack:'Stack', fw:'Frameworks', db:'DB', net:'Network', tools:'Tools', langs:'Languages', music:'Music', uptime:'Uptime', status:'Status' };
      const role = isEs ? 'Desarrollador full-stack' : 'Full-stack developer';
      const uptime = isEs ? '12+ años' : '12+ years';
      const langs = isEs ? 'Español · Inglés (B2)' : 'Spanish · English (B2)';
      const PADW = 12;
      const right = [
        `<span class="color-success">${PROMPT_USER}</span>`,
        `<span class="color-muted">─────────────────────</span>`,
        `<span class="color-sub">${pad(L.os, PADW)}</span><span class="color-val">La Plata, Argentina</span>`,
        `<span class="color-sub">${pad(L.role, PADW)}</span><span class="color-val">${escapeHtml(role)}</span>`,
        `<span class="color-sub">${pad(L.stack, PADW)}</span><span class="color-val">PHP · JavaScript · Python</span>`,
        `<span class="color-sub">${pad(L.fw, PADW)}</span><span class="color-val">Symfony · Laravel · CodeIgniter</span>`,
        `<span class="color-sub">${pad(L.db, PADW)}</span><span class="color-val">MySQL · MariaDB · PostgreSQL</span>`,
        `<span class="color-sub">${pad(L.net, PADW)}</span><span class="color-val">CCNA · Linux sysadmin</span>`,
        `<span class="color-sub">${pad(L.tools, PADW)}</span><span class="color-val">Git · Docker</span>`,
        `<span class="color-sub">${pad(L.langs, PADW)}</span><span class="color-val">${escapeHtml(langs)}</span>`,
        `<span class="color-sub">${pad(L.music, PADW)}</span><span class="color-val">Guitar (UNLP)</span>`,
        `<span class="color-sub">${pad(L.uptime, PADW)}</span><span class="color-val">${uptime}</span>`,
        `<span class="color-sub">${pad(L.status, PADW)}</span><span class="color-success">open to opportunities</span>`,
      ];
      const wrap = document.createElement('div');
      wrap.className = 'output-block neofetch-block';
      wrap.innerHTML = `
        <div class="neofetch-photo"><img src="./assets/me.jpg" alt="profile"></div>
        <div class="neofetch-info">${right.join('\n')}</div>
      `;
      output.appendChild(wrap);
      scrollDown();
    },

    play(arg) {
      if (!arg || arg.toLowerCase() !== 'guitar') {
        return append(`<span class="color-muted">play: try 'play guitar'</span>`, 'output-block');
      }
      appendBlock([
        `<span class="ascii">  ╔═══════════════════════════════╗</span>`,
        `<span class="ascii">  ║   E |---0---2---3---2---0---  ║</span>`,
        `<span class="ascii">  ║   B |---0---3---0---3---0---  ║</span>`,
        `<span class="ascii">  ║   G |---0---2---0---2---0---  ║</span>`,
        `<span class="ascii">  ║   D |---2---0---2---0---2---  ║</span>`,
        `<span class="ascii">  ║   A |---2-------3-------2---  ║</span>`,
        `<span class="ascii">  ║   E |---0-------------------  ║</span>`,
        `<span class="ascii">  ╚═══════════════════════════════╝</span>`,
        `  <span class="color-success">${escapeHtml(t().guitar)}</span>`,
      ]);
    },

    lang(arg) {
      const v = (arg || '').trim().toLowerCase();
      if (v !== 'es' && v !== 'en') {
        return append(`<span class="color-muted">${escapeHtml(t().langUsage)}</span>`, 'output-block');
      }
      lang = v;
      localStorage.setItem('cv_lang', lang);
      append(`<span class="color-success">${escapeHtml(t().langSet)}</span>`, 'output-block');
    },

    sudo() {
      append(`<span class="color-error">${escapeHtml(t().sudo)}</span>`, 'output-block');
    },

    exit() {
      append(`<span class="color-muted">${escapeHtml(t().bye)}</span>`, 'output-block');
    },
  };

  // Aliases
  commands.man = commands.help;
  commands['?'] = commands.help;
  commands.bye = commands.exit;
  commands.quit = commands.exit;

  // ---------- Input handling ----------
  function setInput(val) {
    currentInput = val;
    inputSpan.textContent = val;
    scrollDown();
  }

  function execute(line) {
    appendEcho(line);
    const trimmed = line.trim();
    if (!trimmed) return;
    history.push(trimmed);
    historyIdx = history.length;
    const tokens = trimmed.split(/\s+/);
    const cmd = tokens[0];
    const args = tokens.slice(1).join(' ');
    if (commands[cmd]) {
      try { commands[cmd](args); }
      catch (e) { append(`<span class="color-error">error: ${escapeHtml(e.message)}</span>`, 'output-block'); }
    } else {
      append(`<span class="color-error">${escapeHtml(t().notFound(cmd))}</span>`, 'output-block');
    }
  }

  function onKeyDown(e) {
    if (busy) return;
    if (e.metaKey || e.ctrlKey) {
      if ((e.key === 'l' || e.key === 'L') && e.ctrlKey) {
        e.preventDefault();
        commands.clear();
      }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const line = currentInput;
      setInput('');
      execute(line);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setInput(currentInput.slice(0, -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      historyIdx = Math.max(0, historyIdx - 1);
      setInput(history[historyIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0) return;
      historyIdx = Math.min(history.length, historyIdx + 1);
      setInput(history[historyIdx] || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = Object.keys(commands).filter((c) => c.startsWith(currentInput));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1 && currentInput) {
        append(`<span class="color-muted">${matches.join('  ')}</span>`, 'output-block');
      }
    } else if (e.key.length === 1) {
      e.preventDefault();
      setInput(currentInput + e.key);
    }
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', () => { /* keep focus on terminal */ });

  // ---------- Auto-typing intro ----------
  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function typeAndRun(cmd, perChar = 70) {
    busy = true;
    for (const ch of cmd) {
      currentInput += ch;
      inputSpan.textContent = currentInput;
      scrollDown();
      await sleep(perChar + Math.random() * 40);
    }
    await sleep(220);
    const line = currentInput;
    currentInput = '';
    inputSpan.textContent = '';
    execute(line);
    busy = false;
  }

  async function intro() {
    await sleep(350);
    await typeAndRun('neofetch');
    await sleep(150);
    append(`<span class="color-muted">› tip: escribí <span class="hl">help</span> para ver los comandos disponibles.</span>`, 'output-block');
  }

  intro();
})();
