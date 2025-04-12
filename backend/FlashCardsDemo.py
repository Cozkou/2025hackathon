from FlashCardTools import FlashcardGenerator
def main():
    
    generator = FlashcardGenerator()
    
    
    pdf_path = "" # to be given
    try:
        # try generating 8 flash cards
        text = generator.extract_text_from_pdf()
        processed_text = generator.preprocess_text(text)
        flashcards = generator.generate_flashcards(processed_text, count=8, subject="Business Management")
        print(f"Generated {len(flashcards)} flashcards:")
        for i, card in enumerate(flashcards, 1):
            print(f"\nFlashcard #{i}")
            print(card)
        
        # Saves flashcards
        save_result = generator.save_flashcards_to_file(flashcards)
        print(save_result)
        
        # Get random subset for review
        review_cards = generator.get_random_flashcards(flashcards, 3)
        print("\nRandom cards for review:")
        for i, card in enumerate(review_cards, 1):
            print(f"\nReview Card #{i}")
            print(card)
            
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    import sys
    main()