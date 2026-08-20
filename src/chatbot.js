/* ═══════════════════════════════════════════════════════════════
   bp.ai — Architectural & Construction Knowledge Engine
   BP Engineer's & Construction, Haldwani
   ═══════════════════════════════════════════════════════════════ */

const WHATSAPP_NUMBER = '916395844412';
const INSTAGRAM_HANDLE = '@bpengineersandconstruction';
const OFFICE_LOCATION = 'Gas Godam Chauraha (near Central Hospital), Kusumkhera, Haldwani, Uttarakhand';

export class BPChatbot {
  constructor(containerId = 'bpChatRoot') {
    this.containerId = containerId;
    this.isOpen = false;
    this.history = [];
    this.initDOM();
    this.bindEvents();
    this.addWelcomeMessage();
  }

  initDOM() {
    let host = document.getElementById(this.containerId);
    if (!host) {
      host = document.createElement('div');
      host.id = this.containerId;
      document.body.appendChild(host);
    }

    host.innerHTML = `
      <!-- Floating Circular Launcher -->
      <button class="bp-chat-launcher" id="bpChatLauncher" aria-label="Open bp.ai Assistant" data-cursor="link">
        <img class="bp-chat-launcher__img" src="./logo.png" alt="BP Logo" />
        <span class="bp-chat-launcher__label">bp.ai</span>
        <span class="bp-chat-launcher__dot"></span>
      </button>

      <!-- Chat Window -->
      <div class="bp-chat-window" id="bpChatWindow" aria-hidden="true" data-no-smooth-scroll="true">
        <!-- Minimal Header -->
        <div class="bp-chat-header">
          <div class="bp-chat-header__brand">
            <div class="bp-chat-header__logo">
              <img src="./logo.png" alt="BP Logo" />
            </div>
            <h4 class="bp-chat-header__title">bp<span style="color:#C9A227">.ai</span></h4>
            <span class="bp-chat-header__dot"></span>
          </div>
          <div class="bp-chat-header__actions">
            <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener" class="bp-chat-header__btn" title="WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
            <button class="bp-chat-header__btn" id="bpChatClose" aria-label="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Chat Body -->
        <div class="bp-chat-body" id="bpChatBody" data-no-smooth-scroll="true"></div>

        <!-- Minimal Footer Input -->
        <div class="bp-chat-footer">
          <div class="bp-chat-input-row">
            <input type="text" class="bp-chat-input" id="bpChatInput" placeholder="Ask anything about cost, curing, steel, Vastu..." autocomplete="off" />
            <button class="bp-chat-send-btn" id="bpChatSend" aria-label="Send">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    this.launcher = document.getElementById('bpChatLauncher');
    this.window = document.getElementById('bpChatWindow');
    this.body = document.getElementById('bpChatBody');
    this.input = document.getElementById('bpChatInput');
    this.sendBtn = document.getElementById('bpChatSend');
    this.closeBtn = document.getElementById('bpChatClose');
  }

  bindEvents() {
    this.launcher.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.close());

    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    const stopWheel = (e) => { e.stopPropagation(); };
    this.window.addEventListener('wheel', stopWheel, { passive: true });
    this.body.addEventListener('wheel', stopWheel, { passive: true });

    this.body.addEventListener('click', (e) => {
      const chip = e.target.closest('.bp-chip');
      if (chip) {
        const query = chip.dataset.query || chip.textContent.trim();
        this.sendUserMessage(query);
      }
    });
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.window.classList.add('is-open');
    this.launcher.classList.add('is-hidden');
    this.window.setAttribute('aria-hidden', 'false');
    setTimeout(() => this.input.focus(), 250);
  }

  close() {
    this.isOpen = false;
    this.window.classList.remove('is-open');
    this.launcher.classList.remove('is-hidden');
    this.window.setAttribute('aria-hidden', 'true');
  }

  addWelcomeMessage() {
    const welcomeHtml = `
      <p>Namaste! 🙏 I am <strong>bp.ai</strong>, your structural engineering &amp; architectural advisor at BP Engineer's &amp; Construction, Haldwani.</p>
      <p>Ask any custom question on construction costs, Haldwani map approval, RCC standards, materials, or Vastu:</p>
      <div class="bp-chat-suggestions">
        <button class="bp-chip" data-query="Calculate 1200 sq ft construction cost">💰 1200 sq ft Cost</button>
        <button class="bp-chip" data-query="What is the proper curing time for RCC slab and columns?">💧 Slab Curing Time</button>
        <button class="bp-chip" data-query="What is the difference between M20 and M25 concrete?">🏗️ M20 vs M25</button>
        <button class="bp-chip" data-query="How to stop dampness and wall seepage (seelan)?">🛡️ Seepage Prevention</button>
        <button class="bp-chip" data-query="What are the Vastu rules for Kitchen and Main Door?">🧭 Vastu Rules</button>
        <button class="bp-chip" data-query="How does map approval work in Nagar Nigam Haldwani?">📜 Map Approval Steps</button>
      </div>
    `;
    this.appendBotMessage(welcomeHtml);
  }

  handleSend() {
    const text = this.input.value.trim();
    if (!text) return;
    this.input.value = '';
    this.sendUserMessage(text);
  }

  sendUserMessage(text) {
    this.appendUserMessage(text);
    this.showTyping();

    setTimeout(() => {
      this.hideTyping();
      const botResponse = this.answerCustomQuestion(text);
      this.appendBotMessage(botResponse.html, botResponse.suggestions);
    }, 400 + Math.random() * 250);
  }

  appendUserMessage(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgEl = document.createElement('div');
    msgEl.className = 'bp-msg bp-msg--user';
    msgEl.innerHTML = `
      <div class="bp-msg__bubble">${this.escapeHTML(text)}</div>
      <span class="bp-msg__time">${time}</span>
    `;
    this.body.appendChild(msgEl);
    this.scrollToBottom();
  }

  appendBotMessage(htmlContent, suggestions = []) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgEl = document.createElement('div');
    msgEl.className = 'bp-msg bp-msg--bot';
    
    let chipsHtml = '';
    if (suggestions && suggestions.length > 0) {
      chipsHtml = `
        <div class="bp-chat-suggestions">
          ${suggestions.map(s => `<button class="bp-chip" data-query="${this.escapeHTML(s)}">${this.escapeHTML(s)}</button>`).join('')}
        </div>
      `;
    }

    msgEl.innerHTML = `
      <div class="bp-msg__bubble">${htmlContent}</div>
      ${chipsHtml}
      <span class="bp-msg__time">${time}</span>
    `;
    this.body.appendChild(msgEl);
    this.scrollToBottom();
  }

  showTyping() {
    if (document.getElementById('bpTypingIndicator')) return;
    const typing = document.createElement('div');
    typing.id = 'bpTypingIndicator';
    typing.className = 'bp-typing';
    typing.innerHTML = `<span></span><span></span><span></span>`;
    this.body.appendChild(typing);
    this.scrollToBottom();
  }

  hideTyping() {
    const typing = document.getElementById('bpTypingIndicator');
    if (typing) typing.remove();
  }

  scrollToBottom() {
    this.body.scrollTop = this.body.scrollHeight;
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  /* ─────────────────────────────────────────────────────────────
     DEEP CUSTOM QUESTION ANSWERING ENGINE
     ───────────────────────────────────────────────────────────── */
  answerCustomQuestion(query) {
    const q = query.toLowerCase().trim();

    // 1. Cost & Plot Area calculation
    const areaMatch = q.match(/(\d{2,5})\s*(sq\s*ft|sqft|feet|square\s*feet|gaj|sq\s*yards|yards|bigha)/i) ||
                      q.match(/(?:cost|rate|kharcha|budget|price)\s*(?:for|of|in)?\s*(\d{2,5})/i) ||
                      q.match(/(\d{2,5})\s*(?:ka\s*kharch|cost|budget|sqft)/i);

    const isBHK = q.match(/(\d)\s*bhk/i);
    const isFloor = q.match(/(\d)\s*(?:floor|story|storey|manzil)/i);

    if (areaMatch || isBHK || isFloor || q.includes('cost') || q.includes('rate') || q.includes('kharcha') || q.includes('budget') || q.includes('per sq ft') || q.includes('price')) {
      return this.calculateDynamicCost(q, areaMatch, isBHK, isFloor);
    }

    // 2. Curing Time & Water ponding (Tarai)
    if (q.includes('curing') || q.includes('tarai') || q.includes('paani') || q.includes('watering') || q.includes('curing time') || q.includes('curing days')) {
      return {
        html: `
          <p><strong>Curing (Tarai) Standards (IS 456):</strong></p>
          <ul>
            <li>💧 <strong>RCC Roof Slab</strong>: Minimum <strong>14 to 21 days</strong> with standing water ponding (2–3 inches).</li>
            <li>🏛️ <strong>RCC Columns &amp; Beams</strong>: Minimum <strong>14 days</strong> wrapped tightly in wet Hessian (jute) bags.</li>
            <li>🧱 <strong>Brick Masonry</strong>: <strong>7 to 10 days</strong> spray curing.</li>
            <li>🎨 <strong>Plaster Work</strong>: <strong>10 to 14 days</strong> before putty application.</li>
          </ul>
        `,
        suggestions: [
          'M20 vs M25 concrete',
          'How to prevent seepage (seelan)?',
          'Calculate 1000 sq ft cost'
        ]
      };
    }

    // 3. Concrete Grades (M20, M25, M15, PCC, RCC)
    if (q.includes('m20') || q.includes('m25') || q.includes('m15') || q.includes('grade') || q.includes('concrete mix') || q.includes('ratio')) {
      return {
        html: `
          <p><strong>Concrete Grades for House Construction:</strong></p>
          <ul>
            <li>🧱 <strong>PCC (Base Bedding) — M10 / M15</strong>: Non-structural leveling layer under footing.</li>
            <li>🏗️ <strong>M20 Grade (1 : 1.5 : 3)</strong>: Minimum standard for residential slabs &amp; plinth beams. Strength: 20 N/mm² at 28 days.</li>
            <li>🏢 <strong>M25 Grade (1 : 1 : 2)</strong>: Recommended for <strong>Columns, Footings &amp; Balconies</strong> in Himalayan Seismic Zone IV (Haldwani/Kumaon).</li>
          </ul>
        `,
        suggestions: [
          'Best TMT steel brands',
          'Slab curing duration',
          'Calculate 1200 sq ft cost'
        ]
      };
    }

    // 4. Seepage, Dampness, Waterproofing (Seelan)
    if (q.includes('seepage') || q.includes('dampness') || q.includes('seelan') || q.includes('waterproof') || q.includes('dr fixit') || q.includes('leakage')) {
      return {
        html: `
          <p><strong>Seepage (Seelan) Prevention Protocol:</strong></p>
          <ol>
            <li><strong>Plinth DPC</strong>: 40–50mm dense concrete at DPC with <em>Dr. Fixit 101 LW+</em> and bitumen coating to stop capillary water rising from soil.</li>
            <li><strong>Sunken Slab (Bathrooms)</strong>: 2 coats of <em>Dr. Fixit Fastflex / URP</em> with corner coving before piping.</li>
            <li><strong>Roof Slope</strong>: 1:80 gradient to rainwater outlets + elastomeric membrane.</li>
          </ol>
        `,
        suggestions: [
          'Slab curing guidelines',
          'Calculate 1000 sq ft cost',
          'Message on WhatsApp'
        ]
      };
    }

    // 5. Bricks vs AAC Blocks vs Fly Ash
    if (q.includes('aac') || q.includes('brick') || q.includes('eet') || q.includes('red brick') || q.includes('fly ash') || q.includes('block')) {
      return {
        html: `
          <p><strong>Red Clay Bricks vs. AAC Blocks:</strong></p>
          <div class="bp-card-highlight">
            <div class="bp-card-highlight__row"><span>🧱 Weight:</span><strong>AAC is 50% lighter (ideal for Seismic Zone IV)</strong></div>
            <div class="bp-card-highlight__row"><span>🌡️ Thermal:</span><strong>AAC keeps rooms 3–5°C cooler in summers</strong></div>
            <div class="bp-card-highlight__row"><span>⏱️ Speed:</span><strong>AAC reduces mortar joints by 70%</strong></div>
            <div class="bp-card-highlight__row"><span>💪 Hanging:</span><strong>Red bricks hold heavy wall units directly</strong></div>
          </div>
        `,
        suggestions: [
          'Calculate 1500 sq ft cost',
          'M20 vs M25 concrete',
          'Contact Er. BP Pandey'
        ]
      };
    }

    // 6. Cement & Steel (Sariya) Brands & Selection
    if (q.includes('steel') || q.includes('sariya') || q.includes('tmt') || q.includes('cement') || q.includes('opc') || q.includes('ppc') || q.includes('ultratech') || q.includes('tata')) {
      return {
        html: `
          <p><strong>Material Specifications:</strong></p>
          <ul>
            <li>🏗️ <strong>TMT Steel</strong>: Always use <strong>Fe550D</strong> High Ductility bars (<em>Tata Tiscon, Jindal Panther, Kamdhenu Nxt</em>) for earthquake safety.</li>
            <li>🧱 <strong>Cement</strong>:
              <ul>
                <li><strong>OPC 53</strong>: Fast setting for structural columns &amp; commercial loads.</li>
                <li><strong>PPC</strong>: Lower heat of hydration, superior long-term strength and anti-seepage properties for slabs and brickwork (<em>UltraTech, ACC Super, Ambuja</em>).</li>
              </ul>
            </li>
          </ul>
        `,
        suggestions: [
          'How much steel for 1000 sq ft?',
          'Slab curing duration',
          'Calculate cost'
        ]
      };
    }

    // 7. Foundation, Soil & Plinth Beam
    if (q.includes('foundation') || q.includes('soil') || q.includes('neev') || q.includes('plinth') || q.includes('column') || q.includes('pillar') || q.includes('footing')) {
      return {
        html: `
          <p><strong>Foundation &amp; Sub-structure Standards:</strong></p>
          <ul>
            <li>🌱 <strong>Soil Design</strong>: Isolated trapezoidal footings (4.5–6 ft depth) with PCC bed for Haldwani's bouldery/alluvial terrain.</li>
            <li>🏛️ <strong>Column Sizing</strong>: Minimum <strong>9" × 12"</strong> or <strong>9" × 15"</strong> with 6x 12mm/16mm Fe550D TMT bars.</li>
            <li>🏗️ <strong>Plinth Beam</strong>: Set at least 2.5–3 ft above street crown level.</li>
          </ul>
        `,
        suggestions: [
          'Seismic Zone IV safety',
          'Map approval in Haldwani',
          'Calculate cost'
        ]
      };
    }

    // 8. Earthquake & Seismic Zone IV (Uttarakhand specific)
    if (q.includes('earthquake') || q.includes('seismic') || q.includes('bhukamp') || q.includes('zone 4') || q.includes('zone iv') || q.includes('safety')) {
      return {
        html: `
          <p><strong>Seismic Zone IV Engineering (IS 13920):</strong></p>
          <ul>
            <li>Continuous Plinth, Lintel, and Roof Bands.</li>
            <li>135° hooked ductile stirrups at critical joints.</li>
            <li>Symmetrical structural load paths to resist lateral ground acceleration.</li>
          </ul>
        `,
        suggestions: [
          'M20 vs M25 concrete',
          'Calculate 1200 sq ft cost',
          'WhatsApp enquiry'
        ]
      };
    }

    // 9. Map Approval / Nagar Nigam Haldwani
    if (q.includes('map') || q.includes('naksha') || q.includes('approval') || q.includes('sanction') || q.includes('nagar nigam') || q.includes('ukhdda') || q.includes('authority') || q.includes('pass')) {
      return {
        html: `
          <p><strong>Nagar Nigam Haldwani &amp; UKHDDA Map Sanction:</strong></p>
          <ol>
            <li><strong>Site Survey &amp; Setback Check</strong>: Front (10–15 ft), Rear (5–10 ft), FAR compliance.</li>
            <li><strong>2D Architectural Sanction Drawings</strong>: Floor plans, sections, elevation, rainwater harvesting pit.</li>
            <li><strong>Structural Stability Certificate</strong>: Signed by our registered licensed engineers.</li>
            <li><strong>Required Documents</strong>: Registry/Khatauni, ID proof, Khasra Naksha.</li>
            <li><strong>Sanction Timeline</strong>: Approx 15–30 working days.</li>
          </ol>
        `,
        suggestions: [
          'Vastu rules for house map',
          'Calculate 1000 sq ft cost',
          'Talk to architect'
        ]
      };
    }

    // 10. Vastu Shastra
    if (q.includes('vastu') || q.includes('direction') || q.includes('disha') || q.includes('kitchen') || q.includes('pooja') || q.includes('bedroom') || q.includes('stairs') || q.includes('main door') || q.includes('entrance')) {
      return {
        html: `
          <p><strong>Vastu Shastra Fundamentals:</strong></p>
          <ul>
            <li>🚪 <strong>Main Entrance</strong>: North, North-East (<em>Ishanya</em>), or East.</li>
            <li>🍳 <strong>Kitchen</strong>: South-East (<em>Agneya Kon</em>). Cook facing East.</li>
            <li>🛏️ <strong>Master Bedroom</strong>: South-West (<em>Nairutya Kon</em>) for stability.</li>
            <li>🙏 <strong>Pooja Room</strong>: North-East (<em>Ishanya Kon</em>).</li>
            <li>🪜 <strong>Staircase</strong>: South or West wall (clockwise ascent).</li>
            <li>💧 <strong>Water Tanks</strong>: Underground in NE; Overhead in SW/West.</li>
            <li>🚽 <strong>Septic Tank</strong>: North-West (<em>Vayavya Kon</em>).</li>
          </ul>
        `,
        suggestions: [
          'Calculate 1000 sq ft cost',
          'Map approval in Haldwani',
          'Get 2D Vastu plan'
        ]
      };
    }

    // 11. Plumbing, Electrical, Paints & Interior Fit-outs
    if (q.includes('plumbing') || q.includes('electrical') || q.includes('wiring') || q.includes('paint') || q.includes('tile') || q.includes('interior') || q.includes('kitchen') || q.includes('pipe')) {
      return {
        html: `
          <p><strong>Finishing Specifications:</strong></p>
          <ul>
            <li>🚿 <strong>Plumbing</strong>: <em>Astral / Supreme</em> CPVC piping tested under 10 bar pressure.</li>
            <li>⚡ <strong>Electrical</strong>: <em>Polycab / Havells FRLS</em> copper wiring in conduits.</li>
            <li>🎨 <strong>Paints</strong>: <em>Birla White Putty</em> + <em>Asian Paints Royale (Interiors) / Apex Ultima (Exteriors)</em>.</li>
            <li>🪵 <strong>Modular Kitchen</strong>: BWP 710 Marine Ply with acrylic/laminate and soft-close hardware.</li>
          </ul>
        `,
        suggestions: [
          'Calculate turnkey cost',
          'Seepage prevention',
          'Message on WhatsApp'
        ]
      };
    }

    // 12. About BP Engineers & Office
    if (q.includes('who are you') || q.includes('about') || q.includes('bhuwan') || q.includes('pandey') || q.includes('address') || q.includes('location') || q.includes('office') || q.includes('phone') || q.includes('instagram') || q.includes('whatsapp') || q.includes('haldwani')) {
      return {
        html: `
          <p><strong>BP Engineer's &amp; Construction:</strong></p>
          <div class="bp-card-highlight">
            <div class="bp-card-highlight__row"><span>🏢 Office:</span><strong>${OFFICE_LOCATION}</strong></div>
            <div class="bp-card-highlight__row"><span>📞 WhatsApp:</span><strong>+91 63958 44412</strong></div>
            <div class="bp-card-highlight__row"><span>📸 Instagram:</span><strong><a href="https://www.instagram.com/bpengineersandconstruction/" target="_blank" style="color:#E6C86B">${INSTAGRAM_HANDLE}</a></strong></div>
            <div class="bp-card-highlight__row"><span>🏡 Track Record:</span><strong>100+ families served across Kumaon</strong></div>
            <div class="bp-card-highlight__row"><span>🤝 Contract:</span><strong>Single turnkey contract (Drawings to Keys)</strong></div>
          </div>
        `,
        suggestions: [
          'Calculate 1000 sq ft cost',
          'Map approval in Haldwani',
          'WhatsApp Er. BP Pandey'
        ]
      };
    }

    // 13. General Greetings
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste') || q.includes('kaise ho')) {
      return {
        html: `
          <p>Namaste! 🙏 How can I assist you with your construction or architectural design in Haldwani?</p>
        `,
        suggestions: [
          'Calculate 1000 sq ft cost',
          'Map approval in Haldwani',
          'Vastu rules for Kitchen',
          'WhatsApp Er. BP Pandey'
        ]
      };
    }

    // 14. Intelligent Fallback for Custom Query
    return {
      html: `
        <p>Regarding <strong>"${this.escapeHTML(query)}"</strong>:</p>
        <p>In Indian construction, all structural, material, and layout decisions are calculated as per IS 456, IS 875, and IS 13920 (Seismic Zone IV).</p>
        <p>Would you like an exact estimate, site survey, or drawings for your plot in Haldwani/Kumaon?</p>
        <div class="bp-card-highlight" style="text-align:center;">
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello BP Engineers, ' + query)}" target="_blank" rel="noopener" style="color:#E6C86B; font-weight:600; text-decoration:none;">
            Discuss on WhatsApp ↗
          </a>
        </div>
      `,
      suggestions: [
        'Calculate 1000 sq ft cost',
        'Slab curing duration',
        'Map approval in Haldwani',
        'Vastu guidelines'
      ]
    };
  }

  /* ── Dynamic Construction Cost Estimator ── */
  calculateDynamicCost(q, areaMatch, isBHK, isFloor) {
    let area = 1000;
    let label = '1000 sq. ft.';

    if (areaMatch) {
      const num = parseFloat(areaMatch[1]);
      const matchedUnit = (areaMatch[2] || '').toLowerCase();

      if (matchedUnit.includes('gaj') || matchedUnit.includes('yard')) {
        area = Math.round(num * 9);
        label = `${num} Gaj (${area} sq. ft.)`;
      } else if (matchedUnit.includes('bigha')) {
        area = Math.round(num * 6800);
        label = `${num} Bigha (${area} sq. ft.)`;
      } else {
        area = num;
        label = `${area} sq. ft.`;
      }
    } else if (isBHK) {
      const bhk = parseInt(isBHK[1], 10);
      area = bhk === 1 ? 600 : bhk === 2 ? 1050 : bhk === 3 ? 1500 : 2100;
      label = `${bhk}BHK (approx ${area} sq. ft.)`;
    } else if (isFloor) {
      const floors = parseInt(isFloor[1], 10);
      area = 1000 * floors;
      label = `${floors}-Storey Home (${area} sq. ft. total)`;
    }

    const greyRate = 1050;
    const standardRate = 1650;
    const premiumRate = 2050;
    const luxuryRate = 2550;

    const costGrey = ((area * greyRate) / 100000).toFixed(2);
    const costStd = ((area * standardRate) / 100000).toFixed(2);
    const costPrem = ((area * premiumRate) / 100000).toFixed(2);
    const costLux = ((area * luxuryRate) / 100000).toFixed(2);

    const cementBags = Math.round(area * 0.42);
    const steelTons = (area * 0.0038).toFixed(1);
    const bricksCount = Math.round(area * 22);
    const sandCft = Math.round(area * 1.9);

    const whatsappMsg = encodeURIComponent(
      `Hello BP Engineer's, I calculated an estimate for ${label} construction (₹${costStd}L to ₹${costPrem}L). Please share details.`
    );

    return {
      html: `
        <p>📊 <strong>Estimated Budget for ${label}:</strong></p>
        <div class="bp-card-highlight">
          <div class="bp-card-highlight__row"><span>🏗️ Structure Only:</span><strong>₹${costGrey}L (@ ₹${greyRate}/sq.ft)</strong></div>
          <div class="bp-card-highlight__row"><span>🏡 Standard Turnkey:</span><strong>₹${costStd}L (@ ₹${standardRate}/sq.ft)</strong></div>
          <div class="bp-card-highlight__row"><span>✨ Premium Turnkey:</span><strong>₹${costPrem}L (@ ₹${premiumRate}/sq.ft)</strong></div>
          <div class="bp-card-highlight__row"><span>🏰 Luxury Fit-Out:</span><strong>₹${costLux}L (@ ₹${luxuryRate}/sq.ft)</strong></div>
        </div>

        <p style="margin-top:8px"><strong>Material Breakdown:</strong></p>
        <ul>
          <li>Cement: ~<strong>${cementBags} bags</strong> (UltraTech/ACC)</li>
          <li>Steel (Fe550D): ~<strong>${steelTons} MT</strong> (Tata Tiscon/Jindal)</li>
          <li>Bricks: ~<strong>${bricksCount.toLocaleString('en-IN')} units</strong></li>
          <li>Sand/Bajri: ~<strong>${sandCft.toLocaleString('en-IN')} cu. ft.</strong></li>
        </ul>

        <div class="bp-card-highlight" style="text-align:center; margin-top:8px;">
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}" target="_blank" rel="noopener" style="color:#E6C86B; font-weight:600; text-decoration:none;">
            Get Written Quote on WhatsApp ↗
          </a>
        </div>
      `,
      suggestions: [
        'Map approval in Haldwani',
        'Slab curing duration',
        'Vastu rules for house'
      ]
    };
  }
}
