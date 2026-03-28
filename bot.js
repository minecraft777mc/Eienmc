/**
 * Eienmc Bot - @sanctumterra/client
 * Render.com Start Command: node bot.js
 */

const { Client } = require('@sanctumterra/client');

const HOST     = process.env.MC_HOST || 'play.eienmc.net';
const PORT     = parseInt(process.env.MC_PORT || '19132');
const USERNAME = process.env.MC_USER || 'kullaniciadi'; // ← değiştir

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg) { console.log(`[${new Date().toLocaleTimeString('tr-TR')}] ${msg}`); }

let afkInterval = null;

async function startBot() {
    log(`Bağlanılıyor → ${HOST}:${PORT}`);

    const client = new Client({
        host: HOST,
        port: PORT,
        username: USERNAME,
        offline: true,
    });

    client.on('spawn', async () => {
        log('✅ Spawn oldu!');

        await sleep(3000);
        log('🏝️ /ada komutu gönderiliyor...');
        client.sendMessage('/ada');

        await sleep(2000);
    });

    client.on('modal_form_request', async (packet) => {
        log('📋 Form açıldı');
        await sleep(500);

        try {
            const formData = JSON.parse(packet.data || '{}');
            let response = '0';

            if (formData.type === 'form') {
                const buttons = formData.buttons || [];
                buttons.forEach((b, i) => log(`Buton ${i}: ${b.text}`));

                // Skyblock butonu ara
                for (let i = 0; i < buttons.length; i++) {
                    const t = (buttons[i].text || '').toLowerCase();
                    if (t.includes('skyblock') || t.includes('sky')) {
                        response = String(i);
                        log(`Skyblock seçildi: index ${i}`);
                        break;
                    }
                }

                // Ada git butonu ara
                for (let i = 0; i < buttons.length; i++) {
                    const t = (buttons[i].text || '').toLowerCase();
                    if (t.includes('git') || t.includes('go') || t.includes('ada')) {
                        response = String(i);
                        log(`Ada git seçildi: index ${i}`);
                        break;
                    }
                }
            }

            client.sendPacket('modal_form_response', {
                form_id: packet.form_id || packet.id,
                has_response_data: true,
                data: response,
            });
            log('✅ Form yanıtlandı: ' + response);

            await sleep(3000);
            log('💤 AFK modu aktif.');

            if (afkInterval) clearInterval(afkInterval);
            afkInterval = setInterval(() => {
                log('🔄 Anti-AFK...');
                try { client.sendMessage(''); } catch(e) {}
            }, 4 * 60 * 1000);

        } catch(e) {
            log('Form hatası: ' + e.message);
        }
    });

    client.on('text', (packet) => {
        log(`💬 [CHAT] ${packet.message || ''}`);
    });

    client.on('disconnect', (packet) => {
        log(`❌ Disconnect: ${JSON.stringify(packet)}`);
        if (afkInterval) clearInterval(afkInterval);
        setTimeout(startBot, 20000);
    });

    client.on('close', () => {
        log('❌ Bağlantı kapandı, 20s sonra yeniden bağlanıyor...');
        if (afkInterval) clearInterval(afkInterval);
        setTimeout(startBot, 20000);
    });

    client.on('error', (err) => {
        log(`💥 Hata: ${err.message}`);
        if (afkInterval) clearInterval(afkInterval);
        setTimeout(startBot, 20000);
    });

    client.connect();
}

startBot();
