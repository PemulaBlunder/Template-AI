// =====================
// LEADERBOARD SYSTEM
// =====================

class LeaderboardManager {
  constructor() {
    this.currentTab = 'overall';
    this.data = {
      overall: [],
      snake: [],
      tetris: []
    };
    
    this.init();
  }

  init() {
    this.setupTabs();
    this.loadAllData();
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tab}`);
    });
  }

  async loadAllData() {
    await Promise.all([
      this.loadOverall(),
      this.loadGameLeaderboard('snake'),
      this.loadGameLeaderboard('tetris')
    ]);
  }

  async loadOverall() {
    try {
      const response = await fetch('get_leaderboard.php?type=overall');
      const result = await response.json();
      
      if (result.success) {
        this.data.overall = result.data;
        this.renderOverall();
      } else {
        this.renderError('overall-tbody', result.message);
      }
    } catch (error) {
      console.error('Error loading overall leaderboard:', error);
      this.renderError('overall-tbody', 'Failed to load leaderboard');
    }
  }

  async loadGameLeaderboard(gameKey) {
    try {
      const response = await fetch(`get_leaderboard.php?type=game&game=${gameKey}`);
      const result = await response.json();
      
      if (result.success) {
        this.data[gameKey] = result.data;
        this.renderGameLeaderboard(gameKey);
      } else {
        this.renderError(`${gameKey}-tbody`, result.message);
      }
    } catch (error) {
      console.error(`Error loading ${gameKey} leaderboard:`, error);
      this.renderError(`${gameKey}-tbody`, 'Failed to load leaderboard');
    }
  }

  renderOverall() {
    const tbody = document.getElementById('overall-tbody');
    
    if (this.data.overall.length === 0) {
      tbody.innerHTML = this.getEmptyState();
      return;
    }
    
    tbody.innerHTML = this.data.overall.map((player, index) => {
      const rank = index + 1;
      const rankClass = this.getRankClass(rank);
      const initial = player.username.charAt(0).toUpperCase();
      
      return `
        <tr>
          <td class="rank-col">
            <span class="rank ${rankClass}">${rank}</span>
          </td>
          <td class="player-col">
            <div class="player-info">
              <div class="player-avatar">${initial}</div>
              <span class="player-name">${this.escapeHtml(player.username)}</span>
            </div>
          </td>
          <td class="score-col">
            <span class="score-value">${this.formatScore(player.total_score)}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderGameLeaderboard(gameKey) {
    const tbody = document.getElementById(`${gameKey}-tbody`);
    
    if (this.data[gameKey].length === 0) {
      tbody.innerHTML = this.getEmptyState();
      return;
    }
    
    tbody.innerHTML = this.data[gameKey].map((player, index) => {
      const rank = index + 1;
      const rankClass = this.getRankClass(rank);
      const initial = player.username.charAt(0).toUpperCase();
      
      return `
        <tr>
          <td class="rank-col">
            <span class="rank ${rankClass}">${rank}</span>
          </td>
          <td class="player-col">
            <div class="player-info">
              <div class="player-avatar">${initial}</div>
              <span class="player-name">${this.escapeHtml(player.username)}</span>
            </div>
          </td>
          <td class="score-col">
            <span class="score-value">${this.formatScore(player.best_score)}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  getRankClass(rank) {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'normal';
  }

  formatScore(score) {
    return parseInt(score).toLocaleString('id-ID');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getEmptyState() {
    return `
      <tr>
        <td colspan="3" class="empty-state">
          <div class="icon">🎮</div>
          <p>No scores yet. Be the first to play!</p>
        </td>
      </tr>
    `;
  }

  renderError(tbodyId, message) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">
          <div class="icon">⚠️</div>
          <p>${this.escapeHtml(message)}</p>
        </td>
      </tr>
    `;
  }
}

// Initialize leaderboard
const leaderboard = new LeaderboardManager();