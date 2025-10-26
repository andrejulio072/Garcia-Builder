
# Confirmação de E-mail no Formulário de Contato

**Fluxo:**
1. O usuário preenche o formulário de contato.
2. Após o envio, ele vê uma página de confirmação no site.
3. Um e-mail de confirmação é enviado para o endereço informado.
4. O usuário pode clicar no link do e-mail para validar que o contato é legítimo (opcional para o admin).

> **Importante:**
> - Este fluxo de confirmação é apenas para o formulário de contato, não está vinculado ao sistema de autenticação/login.
> - O usuário pode logar normalmente sem precisar confirmar o e-mail (a confirmação é obrigatória apenas no cadastro, não no login).

## Como usar

- Inclua o script `assets/js/contact-send.js` no formulário de contato.
- O backend está em `api/contact.js`.
- A página de confirmação é `confirm-contact.html`.

## Exemplo de formulário

```html
<form onsubmit="enviarContato(this); return false;">
  <input type="text" name="nome" placeholder="Seu nome" required>
  <input type="email" name="email" placeholder="Seu e-mail" required>
  <textarea name="mensagem" placeholder="Mensagem" required></textarea>
  <button type="submit">Enviar</button>
</form>
```

## Observações

- Configure o e-mail e senha do remetente no backend.
- Em produção, armazene tokens em banco de dados.
- O link de confirmação é enviado para o e-mail informado.
