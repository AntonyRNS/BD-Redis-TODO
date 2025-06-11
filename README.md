# Lista de Tarefas - App Educacional Redis

Este é um aplicativo educacional de lista de tarefas desenvolvido para a disciplina de Bancos de Dados 2, com foco no aprendizado de Redis.

## 🎯 Objetivo

O aplicativo foi criado para que alunos pratiquem a integração com Redis.
A interface da aplicação está pronta faltando apenas a integração para que os alunos implementem as operações de banco de dados.

## ✨ Funcionalidades

- ✅ Lista única de tarefas (sem autenticação)
- ✅ Adicionar novas tarefas
- ✅ Marcar tarefas como concluídas/pendentes
- ✅ Remover tarefas com confirmação
- ✅ Drag and drop para reordenar tarefas
- ✅ Tema claro/escuro com persistência em cookie
- ✅ Toast notifications (sucesso, erro, info, warning)
- ✅ Interface responsiva
- ✅ Loading spinner para operações assíncronas
- ✅ Favicon personalizado

## 🚀 Como Executar

### 1. Instalar dependências

```bash
pip install -r requirements.txt
```

### 2. Configurar Redis

Configure a conexão Redis no arquivo `app.py`:

```python
redis_client = redis.Redis(
    host='seu-host-redis',
    port=6379,
    decode_responses=True,
    username='default',
    password='sua-senha'
)
```

### 3. Executar aplicativo

```bash
python app.py
```

O aplicativo estará disponível em `http://localhost:5001`

## 🛠️ Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Banco de Dados**: Redis
- **Bibliotecas**:
  - SortableJS (drag and drop)
  - Font Awesome (ícones)
  - Google Fonts (Poppins)

## 📱 Características da Interface

### Toast Notifications
- **Sucesso**: Tarefa removida com sucesso
- **Erro**: Falhas de comunicação com servidor
- **Info**: Quantidade de tarefas pendentes ao carregar
- **Warning**: Confirmação antes de remover tarefa

### Tema Claro/Escuro
- Toggle no header
- Persistência via cookie
- Transições suaves
- Cor primária: `#e54724`

### Responsividade
- Mobile-first design
- Adaptação para tablets e desktops
- Touch-friendly na mobile

## 👩‍💻 Para Alunos

### Tarefas a Implementar

Após receber o código sem a integração Redis, você deverá:

1. **Configurar conexão com Redis**
   ```python
   redis_client = redis.Redis(...)
   ```

2. **Implementar função `get_tasks()`**
   - Buscar tarefas do Redis
   - Tratar erros de conexão

3. **Implementar função `save_tasks()`**
   - Salvar lista de tarefas no Redis
   - Serialização/deserialização JSON

4. **Testar todas as operações**
   - Adicionar tarefas
   - Marcar como concluída
   - Remover tarefas
   - Reordenar (drag and drop)

### Estrutura de Dados

```json
{
  "id": "uuid-único",
  "text": "Texto da tarefa",
  "completed": false,
  "order": 0,
  "created_at": "2023-11-15T10:30:00"
}
```

### Chave Redis
- **Chave**: `todo_tasks`
- **Tipo**: String (JSON serializado)

## 📁 Estrutura do Projeto

```
todo_app/
├── app.py                 # Aplicação Flask principal
├── requirements.txt       # Dependências Python
├── README.md             # Este arquivo
├── static/
│   ├── css/
│   │   └── style.css     # Estilos principais
│   ├── js/
│   │   └── app.js        # JavaScript principal
│   └── images/
│       ├── favicon.png   # Favicon 32x32
│       └── favicon-16x16.png
└── templates/
    └── index.html        # Template principal
```

## 🎨 Customização

### Cores do Tema
Edite as variáveis CSS em `style.css`:

```css
:root {
    --primary-color: #e54724;
    --success-color: #47D764;
    --error-color: #ff355b;
    --warning-color: #FFC021;
    --info-color: #2F86EB;
}
```

### Toast Messages
Configure duração e comportamento em `app.js`:

```javascript
// Auto-remover após 5 segundos
setTimeout(() => this.hideToast(toast), 5000);
```

## 📝 Licença

Este projeto é para fins educacionais. Desenvolvido para a disciplina de Bancos de Dados 2.

---

**Desenvolvido com ❤️ para aprendizado de Redis**
