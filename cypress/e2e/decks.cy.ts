it('clears all decks', () => {
  cy.visit('/decks')
  cy.get('[data-testid="import"]').selectFile('cypress/fixtures/demo.json', { force: true })
  cy.contains('Clear all').click()
  cy.contains('No decks loaded')
})
