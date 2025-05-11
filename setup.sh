#!/bin/bash
# Chillar Club - Setup Script

# Style formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}${GREEN}Chillar Club - Setup Script${NC}"
echo -e "${YELLOW}This script will set up the project for development.${NC}\n"

# Check for .env file
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✓ Created .env file. Please update it with your configuration.${NC}\n"
else
  echo -e "${GREEN}✓ .env file already exists.${NC}\n"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed.${NC}\n"

# Setup database
echo -e "${YELLOW}Setting up database...${NC}"
node scripts/db-setup.js
echo -e "${GREEN}✓ Database setup complete.${NC}\n"

# Instructions
echo -e "${BOLD}${GREEN}Setup Complete!${NC}"
echo -e "${BOLD}${YELLOW}Next steps:${NC}"
echo -e "1. Update the ${BOLD}.env${NC} file with your configuration"
echo -e "2. Run ${BOLD}npm run dev${NC} to start the development server"
echo -e "3. Access the application at ${BOLD}http://localhost:3000${NC}\n"
echo -e "${BLUE}Thank you for using Chillar Club!${NC}"