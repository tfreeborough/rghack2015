-- MySQL Script generated by MySQL Workbench
-- Wed Nov 11 19:52:37 2015
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema lcg_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema lcg_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `lcg_db` DEFAULT CHARACTER SET utf8 ;
USE `lcg_db` ;

-- -----------------------------------------------------
-- Table `lcg_db`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lcg_db`.`Users` (
  `UUID` VARCHAR(32) NOT NULL,
  `Username` VARCHAR(64) NOT NULL,
  `PlayerID` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`UUID`),
  UNIQUE INDEX `UUID_UNIQUE` (`UUID` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lcg_db`.`Decks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lcg_db`.`Decks` (
  `UUID` VARCHAR(32) NOT NULL,
  `DeckName` VARCHAR(64) NOT NULL,
  `Cards` MEDIUMTEXT NOT NULL,
  PRIMARY KEY (`UUID`),
  UNIQUE INDEX `UUID_UNIQUE` (`UUID` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lcg_db`.`Cards`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lcg_db`.`Cards` (
  `UUID` VARCHAR(32) NOT NULL,
  `CardName` VARCHAR(255) NOT NULL,
  `DefaultImageFile` VARCHAR(255) NOT NULL,
  `Properties` MEDIUMTEXT NOT NULL,
  PRIMARY KEY (`UUID`),
  UNIQUE INDEX `UUID_UNIQUE` (`UUID` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lcg_db`.`CardSkins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lcg_db`.`CardSkins` (
  `UUID` VARCHAR(32) NOT NULL,
  `Skins` MEDIUMTEXT NOT NULL,
  PRIMARY KEY (`UUID`),
  UNIQUE INDEX `UUID_UNIQUE` (`UUID` ASC))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
