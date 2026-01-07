
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MovieData, BoxOfficeProjection } from "../types";
import { HISTORICAL_MOVIES } from "./backtestData";

// Helper to sanitize JSON strings from markdown blocks or other text
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  // Remove markdown code blocks
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  // Extract JSON object if wrapped in text
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  return cleaned.trim();
};

const CSV_DATA = `Month,Day,Title,Production company,Cast and crew
JANUARY,2,We Bury the Dead,Vertical,"Zak Hilditch (director/screenplay); Daisy Ridley, Mark Coles Smith, Brenton Thwaites"
JANUARY,9,SOULM8TE,Universal Pictures / Blumhouse Productions / Atomic Monster,"Kate Dolan (director/screenplay); Lily Sullivan, David Rysdahl, Claudia Doumit, Oliver Cooper"
JANUARY,9,Greenland 2: Migration,Lionsgate / STXfilms / Thunder Road Films,"Ric Roman Waugh (director); Mitchell LaFortune, Chris Sparling (screenplay); Gerard Butler, Morena Baccarin, Roman Griffin Davis, Amber Rose Revah, Gordon Alexander, Peter Polycarpou, William Abadie, Tommie Earl Jenkins"
JANUARY,9,Primate,Paramount Pictures,"Johannes Roberts (director/screenplay); Ernest Riera (screenplay); Johnny Sequoyah, Jessica Alexander, Troy Kotsur"
JANUARY,9,Dead Man's Wire,Row K Entertainment,"Gus Van Sant (director); Austin Kolodney (screenplay); Bill Skarsgård, Dacre Montgomery, Cary Elwes, Myha'la, Colman Domingo, Al Pacino"
JANUARY,9,People We Meet on Vacation,Netflix / 3000 Pictures / Temple Hill Entertainment,"Brett Haley (director); Yulin Kuang, Amos Vernon, Nunzio Randazzo (screenplay); Emily Bader, Tom Blyth, Sarah Catherine Hook, Jameela Jamil, Lucien Laviscount, Lukas Gage, Alan Ruck, Molly Shannon"
JANUARY,9,Sleepwalker,Brainstorm Media / Appian Way Productions,"Brandon Auman (director/screenplay); Hayden Panettiere, Beverly D'Angelo, Justin Chatwin, Mischa Barton, Lori Tan Chinn, Kea Ho"
JANUARY,9,OBEX,Oscilloscope / Cartuna / Ley Line Entertainment,"Albert Birney (director/screenplay); Pete Ohs (screenplay); Albert Birney, Callie Hernandez, Frank Mosley"
JANUARY,16,28 Years Later: The Bone Temple,Columbia Pictures / DNA Films,"Nia DaCosta (director); Alex Garland (screenplay); Ralph Fiennes, Jack O'Connell, Alfie Williams, Erin Kellyman, Chi Lewis-Parry"
JANUARY,16,The Rip,Netflix / Artists Equity,"Joe Carnahan (director/screenplay); Matt Damon, Ben Affleck, Steven Yeun, Teyana Taylor, Sasha Calle, Catalina Sandino Moreno, Scott Adkins, Kyle Chandler"
JANUARY,16,Night Patrol,RLJE Films / Shudder,"Ryan Prows (director/screenplay); Tim Cairo, Jake Gibson, Shaye Ogbonna (screenplay); Jermaine Fowler, Justin Long, Freddie Gibbs, RJ Cyler, YG, Nicki Micheaux, Flying Lotus, Phil Brooks, Dermot Mulroney"
JANUARY,16,Leave,Falling Forward Films,"Chris Stokes (director/screenplay); Marques Houston (screenplay); Shalèt Monique, Stephen Barrington, V. Bozeman, Newton Mayenge, LaVell Thompson Jr."
JANUARY,16,Signing Tony Raymond,Iconic Events Releasing,"Glen Owen (director/screenplay); Michael Mosley, Mira Sorvino, Rob Morgan, Marshawn Lynch, Charles Esten"
JANUARY,23,Mercy,Metro-Goldwyn-Mayer / Atlas Entertainment / Bazelevs Company,"Timur Bekmambetov (director); Marco van Belle (screenplay); Chris Pratt, Rebecca Ferguson, Annabelle Wallis"
JANUARY,23,Return to Silent Hill,Cineverse / Iconic Events Releasing / Davis Films,"Christophe Gans (director/screenplay); Sandra Vo-Anh, Will Schneider (screenplay); Jeremy Irvine, Hannah Emily Anderson, Evie Templeton"
JANUARY,30,Send Help,20th Century Studios,"Sam Raimi (director); Mark Swift, Damian Shannon (screenplay); Rachel McAdams, Dylan O'Brien"
JANUARY,30,Shelter,Black Bear Pictures / Punch Palace Productions,"Ric Roman Waugh (director); Ward Parry (screenplay); Jason Statham, Bill Nighy, Naomi Ackie, Daniel Mays"
JANUARY,30,Moses the Black,Fathom Entertainment / G-Unit Films and Television Inc. / Cinespace Film Studios,"Yelena Popovic (director/screenplay); Omar Epps, Wiz Khalifa, Quavo, Chukwudi Iwuji"
JANUARY,30,Silver Star,Indican Pictures,"Ruben Amar, Lola Bessis (directors/screenplay); Grace Van Dien, Troy Leigh-Anne Johnson, Johnathan Davis, Tamara Fruits"
FEBRUARY,4,Relationship Goals,Amazon Prime Video,"Linda Mendoza (director); Michael Elliot, Laura Lekkos, Cory Tynan (screenplay); Kelly Rowland, Method Man, Melanie Leishman"
FEBRUARY,6,Untitled Blumhouse Productions film,Universal Pictures / Blumhouse Productions,
FEBRUARY,6,Solo Mio,Angel / Kinnane Brothers,"Chuck Kinnane, Dan Kinnane (directors); James Kinnane, Patrick Kinnane, Kevin James (screenplay); Kevin James, Alyson Hannigan, Kim Coates, Jonathan Roumie, Julee Cerda, Julie Ann Emery"
FEBRUARY,6,The Third Parent,Bleecker Street,"David Michaels (director/screenplay); Rob Lowe, Roselyn Sánchez, Crispin Glover"
FEBRUARY,13,Goat,Columbia Pictures / Sony Pictures Animation / Unanimous Media,"Tyree Dillihay (director); Aaron Buchsbaum, Teddy Riley (screenplay); Caleb McLaughlin, Gabrielle Union, Stephen Curry, Nicola Coughlan, Nick Kroll, David Harbour, Jenifer Lewis, Aaron Pierre, Patton Oswalt, Andrew Santino, Bobby Lee, Eduardo Franco, Sherry Cola, Jelly Roll, Jennifer Hudson"
FEBRUARY,13,Wuthering Heights,Warner Bros. Pictures / MRC / LuckyChap Entertainment,"Emerald Fennell (director/screenplay); Margot Robbie, Jacob Elordi, Hong Chau, Shazad Latif, Alison Oliver, Martin Clunes, Ewan Mitchell"
FEBRUARY,13,Crime 101,Metro-Goldwyn-Mayer / Raw / Working Title Films,"Bart Layton (director/screenplay); Peter Straughan (screenplay); Chris Hemsworth, Mark Ruffalo, Barry Keoghan, Monica Barbaro, Corey Hawkins, Jennifer Jason Leigh, Nick Nolte, Halle Berry"
FEBRUARY,13,"Good Luck, Have Fun, Don't Die",Briarcliff Entertainment / 3 Arts Entertainment / Blind Wink Productions / Constantin Film,"Gore Verbinski (director); Matthew Robinson (screenplay); Sam Rockwell, Haley Lu Richardson, Michael Peña, Zazie Beetz, Asim Chaudhry, Tom Taylor, Juno Temple"
FEBRUARY,13,Cold Storage,Samuel Goldwyn Films / StudioCanal,"Jonny Campbell (director); David Koepp (screenplay); Georgina Campbell, Joe Keery, Sosie Bacon, Vanessa Redgrave, Lesley Manville, Liam Neeson"
FEBRUARY,20,Psycho Killer,20th Century Studios / Regency Enterprises / Constantin Film / Vertigo Entertainment,"Gavin Polone (director); Andrew Kevin Walker (screenplay); Georgina Campbell, Logan Miller, Grace Dove, Jordan Preston Rogers, Malcolm McDowell"
FEBRUARY,20,I Can Only Imagine 2,Lionsgate / Kingdom Story Company,"Andrew Erwin, Brent McCorkle (directors); Brent McCorkle (screenplay); John Michael Finley, Sophie Skelton, Trace Adkins, Arielle Kebbel, Joshua Bassett, Sammy Dell, Milo Ventimiglia, Dennis Quaid"
FEBRUARY,20,Redux Redux,Saban Films,"Kevin McManus, Matthew McManus (directors/screenplay); Michaela McManus, Jim Cummings, Grace Van Dien, Taylor Misiak"
FEBRUARY,20,Protector,Magneta Light Studios,"Adrian Grünberg (director); Bong-Seob Mun (screenplay); Milla Jovovich, Matthew Modine, D. B. Sweeney, Don Harvey, Arica Himmel, Michael Stahl-David"
FEBRUARY,27,Scream 7,Paramount Pictures / Spyglass Media Group,"Kevin Williamson (director); Guy Busick (screenplay); Neve Campbell, Courteney Cox, Isabel May, Celeste O'Connor, Asa Germann, Mckenna Grace, Sam Rechner, Jasmin Savoy Brown, Mason Gooding, Anna Camp, Joel McHale, Mark Consuelos, David Arquette, Scott Foley, Matthew Lillard, Ethan Embry"
MARCH,6,Hoppers,Walt Disney Pictures / Pixar Animation Studios,"Daniel Chong (director/screenplay); Piper Curda, Bobby Moynihan, Jon Hamm, Demetri Martin, Melissa Villaseñor"
MARCH,6,The Bride!,Warner Bros. Pictures,"Maggie Gyllenhaal (director/screenplay); Jessie Buckley, Christian Bale, Peter Sarsgaard, Annette Bening, Jake Gyllenhaal, Penélope Cruz"
MARCH,13,The Breadwinner,TriStar Pictures / Wonder Project,"Eric Appel (director/screenplay); Nate Bargatze, Dan Lagana (screenplay); Nate Bargatze, Mandy Moore, Will Forte, Colin Jost, Kumail Nanjiani"
MARCH,13,Reminders of Him,Universal Pictures / Little Engine Productions,"Vanessa Caswill (director); Colleen Hoover, Lauren Levine (screenplay); Maika Monroe, Tyriq Withers, Rudy Pankow, Lainey Wilson, Lauren Graham, Bradley Whitford"
MARCH,20,Project Hail Mary,Metro-Goldwyn-Mayer / Pascal Pictures / Lord Miller Productions,"Phil Lord, Christopher Miller (directors); Drew Goddard (screenplay); Ryan Gosling, Sandra Hüller, Milana Vayntrub"
MARCH,20,Whitney Springs,Paramount Pictures / PGLang,Trey Parker (director); Vernon Chatman (screenplay)
MARCH,20,The Pout-Pout Fish,Viva Pictures,"Ricard Cussó, Rio Harrington (directors); Elise Allen, Elie Choufany (screenplay); Nick Offerman, Nina Oyama, Miranda Otto, Jordin Sparks, Amy Sedaris"
MARCH,27,The Dog Stars,20th Century Studios / Scott Free Productions,"Ridley Scott (director); Mark L. Smith, Christopher Wilkinson (screenplay); Jacob Elordi, Margaret Qualley, Josh Brolin, Guy Pearce, Benedict Wong"
MARCH,27,They Will Kill You,Warner Bros. Pictures / New Line Cinema / Skydance Media / Nocturna,"Kirill Sokolov (director/screeplay); Alex Litvak (screenplay); Zazie Beetz, Myha'la, Tom Felton, Heather Graham, Patricia Arquette"
APRIL,3,The Super Mario Galaxy Movie,Universal Pictures / Illumination / Nintendo,"Aaron Horvath, Michael Jelenic (directors); Matthew Fogel (screenplay); Chris Pratt, Anya Taylor-Joy, Charlie Day, Jack Black, Keegan-Michael Key, Kevin Michael Richardson, Brie Larson, Benny Safdie"
APRIL,3,The Drama,A24,"Kristoffer Borgli (director/screenplay); Zendaya, Robert Pattinson, Mamoudou Athie, Alana Haim, Hailey Gates"
APRIL,3,A Great Awakening,Roadside Attractions / Sight & Sound Films,"Joshua Enck (director/screenplay); Jeff Bender, Jonathan Blair (screenplay); Jonathan Blair, Josh Bates, Stephen Foster Harris"
APRIL,10,Ready or Not 2: Here I Come,Searchlight Pictures / Radio Silence Productions,"Matt Bettinelli-Olpin, Tyler Gillett (directors); Guy Busick, R. Christopher Murphy (screenplay); Samara Weaving, Kathryn Newton, Sarah Michelle Gellar, Shawn Hatosy, Néstor Carbonell, Kevin Durand, Olivia Cheng, David Cronenberg, Elijah Wood"
APRIL,10,"You, Me & Tuscany",Universal Pictures / Will Packer Productions,"Kat Coiro (director); Ryan Engle (screenplay); Halle Bailey, Regé-Jean Page, Marco Calvani, Lorenzo de Moor, Aziza Scott, Nia Vardalos"
APRIL,17,The Mummy,Warner Bros. Pictures / New Line Cinema / Blumhouse Productions / Atomic Monster,"Lee Cronin (director/screenplay); Jack Reynor, Laia Costa, Verónica Falcón, May Calamawy"
APRIL,17,4 Kids Walk Into a Bank,Amazon MGM Studios / Orion Pictures / Miramax / Picturestart / Point Grey Pictures / Black Mask Studios,"Frankie Shaw (director/screenplay); Matt Robinson (screenplay); Liam Neeson, Talia Ryder, Whitney Peak, Jack Dylan Grazer, Spike Fearn, Teresa Palmer, Jim Sturgess"
APRIL,17,Normal,Magnolia Pictures,"Ben Wheatley (director); Derek Kolstad (screenplay); Bob Odenkirk, Henry Winkler, Lena Headey"
APRIL,24,Michael,Lionsgate / Universal Pictures / GK Films,"Antoine Fuqua (director); John Logan (screenplay); Jaafar Jackson, Nia Long, Laura Harrier, Juliano Krue Valdi, Miles Teller, Colman Domingo"
MAY,1,The Devil Wears Prada 2,20th Century Studios / Wendy Finerman Productions,"David Frankel (director); Aline Brosh McKenna (screenplay); Meryl Streep, Anne Hathaway, Emily Blunt, Stanley Tucci, Kenneth Branagh, Simone Ashley, Justin Theroux, Lucy Liu"
MAY,1,Deep Water,Magneta Light Studios / Arclight Films / Simmons/Hamilton Productions,"Renny Harlin (director); Shayne Armstrong (screenplay); Aaron Eckhart, Ben Kingsley, Angus Sampson, Kelly Gale, Madeleine West, Kate Fitzpatrick, Mark Hadlow"
MAY,8,Mortal Kombat II,Warner Bros. Pictures / New Line Cinema / Atomic Monster,"Simon McQuoid (director); Jeremy Slater (screenplay); Karl Urban, Adeline Rudolph, Jessica McNamee, Josh Lawson, Ludi Lin, Mehcad Brooks, Tati Gabrielle, Lewis Tan, Damon Herriman, Chin Han, Tadanobu Asano, Joe Taslim, Hiroyuki Sanada"
MAY,8,The Sheep Detectives,Metro-Goldwyn-Mayer / Working Title Films / Lord Miller Productions,"Kyle Balda (director); Craig Mazin (screenplay); Hugh Jackman, Emma Thompson, Nicholas Braun, Nicholas Galitzine, Molly Gordon, Hong Chau, Tosin Cole, Kobna Holdbrook-Smith, Bryan Cranston, Julia Louis-Dreyfus, Chris O'Dowd, Regina Hall, Patrick Stewart"
MAY,15,Is God Is,Amazon MGM Studios / Orion Pictures,"Aleshea Harris (director/screenplay); Kara Young, Mallori Johnson, Janelle Monáe, Erika Alexander, Mykelti Williamson, Josiah Cross, Vivica A. Fox, Sterling K. Brown"
MAY,15,Poetic License,Row K Entertainment / Apatow Productions,"Maude Apatow (director); Raffi Donatich (screenplay); Leslie Mann, Andrew Barth Feldman, Cooper Hoffman, Nico Parker, Maisy Stella, Method Man, Martha Kelly, Jake Bongiovi"
MAY,15,Obsession,Focus Features,"Curry Barker (director/screenplay); Michael Johnston, Inde Navarrette, Cooper Tomlinson, Megan Lawless, Andy Richter"
MAY,22,The Mandalorian and Grogu,Lucasfilm,"Jon Favreau (director/screenplay); Dave Filoni (screenplay); Pedro Pascal, Sigourney Weaver, Jeremy Allen White, Jonny Coyne"
MAY,22,I Love Boosters,Neon / Annapurna Pictures,"Boots Riley (director/screenplay); Demi Moore, Keke Palmer, Naomi Ackie, Taylour Paige, LaKeith Stanfield, Eiza González, Poppy Liu, Will Poulter"
JUNE,5,Masters of the Universe,Metro-Goldwyn-Mayer / Mattel Films / Escape Artists,"Travis Knight (director); Chris Butler (screenplay); Nicholas Galitzine, Camila Mendes, Idris Elba, Alison Brie, Morena Baccarin, Jóhannes Haukur Jóhannesson, Kristen Wiig, Jared Leto"
JUNE,5,Animal Friends,Warner Bros. Pictures / Legendary Pictures / Maximum Effort / Prime Focus Studios,"Peter Atencio (director); Kevin Burrows, Matt Mider (screenplay); Ryan Reynolds, Jason Momoa, Vince Vaughn, Eric André, Addison Rae, Ellie Bamber, Rob Delaney, Lil Rel Howery, Daniel Levy, Aubrey Plaza"
JUNE,5,Power Ballad,Lionsgate / 30West / Screen Ireland / Likely Story,"John Carney (director/screenplay); Peter McDonald (screenplay); Paul Rudd, Nick Jonas, Jack Reynor, Havana Rose Liu, Sophie Vavasseur"
JUNE,12,Untitled Steven Spielberg film,Universal Pictures / Amblin Entertainment,"Steven Spielberg (director); David Koepp (screenplay); Emily Blunt, Josh O'Connor, Eve Hewson, Colman Domingo, Wyatt Russell, Colin Firth"
JUNE,12,Scary Movie 6,Paramount Pictures / Miramax / Original Film,"Michael Tiddes (director); Marlon Wayans, Shawn Wayans, Keenen Ivory Wayans, Rick Alvarez (screenplay); Anna Faris, Regina Hall, Marlon Wayans, Shawn Wayans, Jon Abrahams, Lochlyn Munro, Cheri Oteri, Dave Sheridan, Chris Elliott"
JUNE,19,Toy Story 5,Walt Disney Pictures / Pixar Animation Studios,"Andrew Stanton (director/screenplay); Tom Hanks, Tim Allen, Joan Cusack, Greta Lee, Blake Clark, Ernie Hudson, Tony Hale, Conan O'Brien, Anna Faris"
JUNE,26,Supergirl,Warner Bros. Pictures / DC Studios,"Craig Gillespie (director); Ana Nogueira (screenplay); Milly Alcock, Matthias Schoenaerts, Eve Ridley, David Krumholtz, Emily Beecham, Jason Momoa"
JULY,1,Minions 3,Universal Pictures / Illumination,Pierre Coffin (director); Brian Lynch (screenplay); Pierre Coffin
JULY,3,Shiver,Columbia Pictures / Hyperobject Industries,"Tommy Wirkola (director/screenplay); Phoebe Dynevor, Whitney Peak, Djimon Hounsou"
JULY,3,Young Washington,Angel / Wonder Project,"Jon Erwin (director/screenplay); Tom Provost, Diederik Hoogstraten (screenplay); William Franklyn-Miller, Mary-Louise Parker, Kelsey Grammer, Andy Serkis, Ben Kingsley"
JULY,10,Moana,Walt Disney Pictures / Seven Bucks Productions,"Thomas Kail (director); Jared Bush, Dana Ledoux Miller (screenplay); Catherine Laga'aia, Dwayne Johnson, John Tui, Frankie Adams, Rena Owen"
JULY,17,The Odyssey,Universal Pictures / Syncopy Inc.,"Christopher Nolan (director/screenplay); Matt Damon, Tom Holland, Anne Hathaway, Zendaya, Lupita Nyong'o, Robert Pattinson, Charlize Theron, Jon Bernthal, Benny Safdie, John Leguizamo, Elliot Page, Himesh Patel, Bill Irwin, Samantha Morton, Mia Goth, Corey Hawkins, Logan Marshall-Green"
JULY,17,Cut Off,Warner Bros. Pictures,"Jonah Hill (director/screenplay); Ezra Woods (screenplay); Jonah Hill, Kristen Wiig, Bette Midler, Nathan Lane, Adriana Barraza, Camila Cabello, Langston Kerman"
JULY,24,Evil Dead Burn,Warner Bros. Pictures / New Line Cinema / Ghost House Pictures,"Sébastien Vaniček (director/screenplay); Florent Bernard (screenplay); Souheila Yacoub, Hunter Doohan, Luciane Buchanan, Tandi Wright, George Pullar, Erroll Shand"
JULY,31,Spider-Man: Brand New Day,Columbia Pictures / Marvel Studios / Pascal Pictures,"Destin Daniel Cretton (director); Chris McKenna, Erik Sommers (screenplay); Tom Holland, Zendaya, Jacob Batalon, Sadie Sink, Liza Colón-Zayas, Jon Bernthal, Mark Ruffalo, Michael Mando, Tramell Tillman, Marvin Jones III"
AUGUST,7,One Night Only,Universal Pictures / Olive Bridge Entertainment,"Will Gluck (director/screenplay); Travis Braun (screenplay); Monica Barbaro, Callum Turner, Molly Ringwald, LeVar Burton"
AUGUST,14,Flowervale Street,Warner Bros. Pictures / Bad Robot,"David Robert Mitchell (director/screenplay); Anne Hathaway, Ewan McGregor, Maisy Stella, Christian Convery"
AUGUST,21,Untitled Insidious sequel,Screen Gems / Stage 6 Films / Blumhouse Productions,"Jacob Chase (director/screenplay); David Leslie Johnson (screenplay); Lin Shaye, Brandon Perea, Amelia Eve, Maisie Richardson-Sellers, Sam Spruell, Laura Gordon"
AUGUST,21,Mutiny,Lionsgate / MadRiver Pictures / Punch Palace Productions,"Jean-François Richet (director); J. P. Davis, Lindsay Michel (screenplay); Jason Statham, Annabelle Wallis, Roland Møller, Jason Wong, Arnas Fedaravicius, Adrian Lester"
AUGUST,28,Coyote vs. Acme,Ketchup Entertainment / Warner Bros. Pictures / Warner Bros. Pictures Animation,"Dave Green (director); Samy Burch (screenplay); Will Forte, John Cena, Lana Condor, P. J. Byrne, Tone Bell, Martha Kelly, Eric Bauza"
AUGUST,28,Cliffhanger,Row K Entertainment / Original Film / StudioCanal,"Jaume Collet-Serra (director); Ana Lily Amirpour (screenplay); Lily James, Pierce Brosnan, Nell Tiger Free, Franz Rogowski, Shubham Saraf, Assaad Bouab, Suzy Bemba, Bruno Gouery"
SEPTEMBER,4,How to Rob a Bank,Metro-Goldwyn-Mayer / Imagine Entertainment / 87North Productions,"David Leitch (director); Mark Bianculli (screenplay); Nicholas Hoult, Anna Sawai, Pete Davidson, Rhenzy Feliz, Zoë Kravitz, John C. Reilly, Christian Slater"
SEPTEMBER,11,Clayface,Warner Bros. Pictures / DC Studios / 6th & Idaho Productions,"James Watkins (director); Mike Flanagan, Hossein Amini (screenplay); Tom Rhys Harries, Naomi Ackie, Max Minghella, Eddie Marsan"
SEPTEMBER,11,Sense and Sensibility,Focus Features / Working Title Films,"Georgia Oakley (director); Diana Reid (screenplay); Daisy Edgar-Jones, Esmé Creed-Miles, Caitríona Balfe, Frank Dillane, Herbert Nordrum, Bodhi Rae Breathnach, George MacKay, Fiona Shaw"
SEPTEMBER,18,Resident Evil,Columbia Pictures / PlayStation Productions / Capcom / Constantin Film,"Zach Cregger (director/screenplay); Shay Hatten (screenplay); Austin Abrams, Paul Walter Hauser, Zach Cherry, Kali Reis"
SEPTEMBER,18,Practical Magic 2,Warner Bros. Pictures / Fortis Films / Blossom Films,"Susanne Bier (director); Akiva Goldsman, Georgia Pritchett (screenplay); Sandra Bullock, Nicole Kidman, Joey King, Xolo Maridueña, Maisie Williams, Lee Pace, Stockard Channing, Dianne Wiest"
SEPTEMBER,25,Forgotten Island,Universal Pictures / DreamWorks Animation,"Joel Crawford, Januel Mercado (directors/screenplay); H.E.R., Liza Soberano, Lea Salonga, Dave Franco, Manny Jacinto, Jenny Slate"
SEPTEMBER,25,Charlie Harper,Row K Entertainment / Temple Hill Entertainment,"Tom Dean (director/screenplay); Mac Eldridge (director); Emilia Jones, Nick Robinson, Nicholas Cirillo"
OCTOBER,2,Untitled Alejandro G. Iñárritu film,Warner Bros. Pictures / Legendary Pictures,"Alejandro González Iñárritu (director/screenplay); Sabina Berman, Alexander Dinelaris Jr., Nicolás Giacobone (screenplay); Tom Cruise, Jesse Plemons, Sandra Hüller, Sophie Wilde, Riz Ahmed, Emma D'Arcy, Robert John Burke, Burn Gorman, Michael Stuhlbarg, John Goodman"
OCTOBER,2,Verity,Metro-Goldwyn-Mayer / Shiny Penny Productions,"Michael Showalter (director); Nick Antosca (screenplay); Anne Hathaway, Dakota Johnson, Josh Hartnett, Ismael Cruz Córdova"
OCTOBER,9,The Legend of Aang: The Last Airbender,Paramount Pictures / Nickelodeon Movies / Avatar Studios,"Lauren Montgomery (director); Eric Nam, Dionne Quan, Jessica Matten, Román Zaragoza, Dave Bautista, Steven Yeun"
OCTOBER,9,The Social Reckoning,Columbia Pictures / Escape Artists,"Aaron Sorkin (director/screenplay); Jeremy Strong, Jeremy Allen White, Mikey Madison, Bill Burr, Wunmi Mosaku, Billy Magnussen, Betty Gilpin, Gbenga Akinnagbe, Anna Lambe"
OCTOBER,9,Other Mommy,Universal Pictures / Blumhouse Productions / Atomic Monster,"Rob Savage (director); Nathan Elston (screenplay); Jessica Chastain, Jay Duplass, Dichen Lachman, Sean Kaufman, Karen Allen"
OCTOBER,16,Street Fighter,Paramount Pictures / Legendary Pictures / Capcom,"Kitao Sakurai (director); Dalan Musson (screenplay); Andrew Koji, Noah Centineo, Callina Liang, Roman Reigns, David Dastmalchian, Cody Rhodes, Andrew Schulz, Eric André, Vidyut Jammwal, Curtis ""50 Cent"" Jackson, Jason Momoa"
OCTOBER,16,Whalefall,20th Century Studios / Imagine Entertainment / 3 Arts Entertainment,"Brian Duffield (director/screenplay); Daniel Kraus (screenplay); Austin Abrams, Josh Brolin, Elisabeth Shue, John Ortiz, Jane Levy, Emily Rudd"
OCTOBER,23,Remain,Warner Bros. Pictures / Blinding Edge Pictures,"M. Night Shyamalan (director/screenplay); Nicholas Sparks (screenplay); Jake Gyllenhaal, Phoebe Dynevor, Ashley Walters, Julie Hagerty"
NOVEMBER,6,The Cat in the Hat,Warner Bros. Pictures / Warner Bros. Pictures Animation,"Erica Rivinoja, Alessandro Carloni (directors/screenplay); Bill Hader, Xochitl Gomez, Matt Berry, Quinta Brunson, Paula Pell, Tiago Martinez, Giancarlo Esposito, America Ferrera, Bowen Yang, Tituss Burgess"
NOVEMBER,6,Archangel,Columbia Pictures / Mandalay Pictures,"William Eubank (director); Chris Papasadero, Randall Wallace (screenplay); Jim Caviezel, Olivia Thirlby, Garret Dillahunt, Shea Whigham"
NOVEMBER,13,Ebenezer: A Christmas Carol,Paramount Pictures,"Ti West (director); Nathaniel Halpern (screenplay); Johnny Depp, Andrea Riseborough, Tramell Tillman, Ian McKellen"
NOVEMBER,20,The Hunger Games: Sunrise on the Reaping,Lionsgate / Color Force,"Francis Lawrence (director); Billy Ray (screenplay); Joseph Zada, Whitney Peak, Mckenna Grace, Jesse Plemons, Kelvin Harrison Jr., Maya Hawke, Lili Taylor, Ben Wang, Iris Apatow, Elle Fanning, Kieran Culkin, Billy Porter, Glenn Close, Ralph Fiennes"
NOVEMBER,25,Focker In-Law,Universal Pictures / Paramount Pictures / Tribeca Enterprises / Red Hour Productions,"John Hamburg (director/screenplay); Robert De Niro, Ben Stiller, Owen Wilson, Blythe Danner, Teri Polo, Ariana Grande"
NOVEMBER,25,Hexed,Walt Disney Pictures / Walt Disney Animation Studios,"Josie Trinidad, Jason Hand (directors)"
NOVEMBER,26,Narnia: The Magician's Nephew,Netflix / Pascal Pictures / Entertainment One,"Greta Gerwig (director/screenplay); Emma Mackey, Daniel Craig, Meryl Streep, Carey Mulligan, Denise Gough"
DECEMBER,4,Violent Night 2,Universal Pictures / 87North Productions,"Tommy Wirkola (director); Pat Casey, Josh Miller (screenplay); David Harbour, Daniela Melchior, Kristen Bell, Jared Harris, Joe Pantoliano, Maxwell Friedman, Andrew Bachelor"
DECEMBER,11,Untitled Jumanji: The Next Level sequel,Columbia Pictures / Seven Bucks Productions,"Jake Kasdan (director); Jeff Pinkner, Scott Rosenberg (screenplay); Dwayne Johnson, Jack Black, Kevin Hart, Karen Gillan, Nick Jonas, Awkwafina, Alex Wolff, Morgan Turner, Ser'Darius Blain, Madison Iseman, Burn Gorman, Bebe Neuwirth, Lamorne Morris, Danny DeVito"
DECEMBER,18,Avengers: Doomsday,Marvel Studios / AGBO,"Anthony Russo, Joe Russo (directors); Stephen McFeely, Michael Waldron (screenplay); Chris Hemsworth, Vanessa Kirby, Anthony Mackie, Sebastian Stan, Letitia Wright, Paul Rudd, Wyatt Russell, Tenoch Huerta Mejía, Ebon Moss-Bachrach, Simu Liu, Florence Pugh, Kelsey Grammer, Lewis Pullman, Danny Ramirez, Joseph Quinn, David Harbour, Winston Duke, Hannah John-Kamen, Tom Hiddleston, Patrick Stewart, Ian McKellen, Alan Cumming, Rebecca Romijn, James Marsden, Channing Tatum, Pedro Pascal, Robert Downey Jr."
DECEMBER,18,Dune: Part Three,Warner Bros. Pictures / Legendary Pictures,"Denis Villeneuve (director/screenplay); Jon Spaihts (screenplay); Timothée Chalamet, Zendaya, Florence Pugh, Jason Momoa, Josh Brolin, Rebecca Ferguson, Anya Taylor-Joy, Robert Pattinson"
DECEMBER,23,The Angry Birds Movie 3,Paramount Pictures / Sega Sammy Group / Rovio Entertainment / Prime Focus Studios / One Cool Group / Dentsu,"John Rice (director); Thurop Van Orman (screenplay); Jason Sudeikis, Josh Gad, Emma Myers, Rachel Bloom, Marcello Hernandez, Keke Palmer, Tim Robinson, Walker Scobell, Nikki Glaser, MrBeast, Salish Matter, Danny McBride, Lily James, Maitreyi Ramakrishnan, Sam Richardson, Psalm West, James Austin Johnson, Anthony Padilla, Ian Hecox"
DECEMBER,25,Werwulf,Focus Features / Working Title Films / Maiden Voyage Pictures,"Robert Eggers (director/screenplay); Sjón (screenplay); Aaron Taylor-Johnson, Willem Dafoe, Lily-Rose Depp, Ralph Ineson"`;

const parseCSVLine = (text: string): string[] => {
  const result: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      result.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result.map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
};

const parseMoviesFromCSV = (): MovieData[] => {
  const lines = CSV_DATA.trim().split('\n');
  const movies: MovieData[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    // Month, Day, Title, Studio, Cast&Crew
    if (parts.length < 3) continue;
    
    const month = parts[0];
    const day = parts[1];
    const title = parts[2];
    const studio = parts[3] || 'Unknown';
    const castAndCrewRaw = parts[4] || '';
    
    let director = '';
    let cast: string[] = [];
    
    if (castAndCrewRaw) {
      const ccParts = castAndCrewRaw.split(';');
      const directorPart = ccParts.find(p => p.toLowerCase().includes('director'));
      
      if (directorPart) {
        const nameMatch = directorPart.match(/^(.*?)\s*\(/);
        if (nameMatch) {
          director = nameMatch[1].trim();
        } else {
            director = directorPart.trim();
        }
      }
      
      if (ccParts.length > 1) {
         const castPart = ccParts.find(p => !p.toLowerCase().includes('director'));
         if (castPart) {
            cast = castPart.split(',').map(c => c.trim());
         }
      } else if (!directorPart && ccParts.length === 1) {
         cast = ccParts[0].split(',').map(c => c.trim());
      }
    }
    
    movies.push({
      // DETERMINISTIC ID: 'mov_' + index
      id: `mov_${i}`,
      title,
      studio,
      releaseDate: `${month} ${day}, 2026`,
      director,
      cast,
      genre: 'Drama',
    });
  }
  return movies;
};

export const fetchUpcomingMovies2026 = async (): Promise<MovieData[]> => {
  return Promise.resolve(parseMoviesFromCSV());
};

export const generateProjection = async (movie: MovieData): Promise<BoxOfficeProjection> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an autonomous Box Office Prediction Engine combining two methodologies:
    1. Matt Vitelli's Network Model (Stanford): Focuses on Actor Degree Centrality and Graph Density (Competition).
    2. Kaggle TMDB Random Forest Model: Focuses on Log(Budget), Franchise Boolean, Runtime, and Popularity.

    TARGET MOVIE: "${movie.title}" (${movie.releaseDate}, ${movie.studio})
    KNOWN CAST: ${movie.cast?.join(', ') || 'Unknown'}
    KNOWN DIRECTOR: ${movie.director || 'Unknown'}

    PHASE 1: AUTOMATED DATA DISCOVERY (Use your tools)
    - Search for the likely Production Budget for this 2026 film. If unknown, estimate based on franchise/studio history.
    - If Cast/Director is "Unknown" above, Search for them.
    - Determine if it is a Sequel/Franchise (Critical for Kaggle Model).
    - Determine the exact release window competition (Vitelli Model).

    PHASE 2: PREDICTION LOGIC
    - Apply Kaggle Logic: Higher Budget + Franchise = Exponentially higher revenue baseline. 
    - Apply Vitelli Logic: High Star Power (Centrality) boosts the ceiling. High Competition lowers the floor.
    
    PHASE 3: OUTPUT
    Generate a JSON prediction. 
    IMPORTANT: Return ONLY the raw JSON string. Do not use Markdown code blocks.

    Format:
    {
      "movieId": "${movie.id}",
      "movieTitle": "${movie.title}",
      "worldwideTotal": (Number in Millions),
      "openingWeekendLow": (Number),
      "openingWeekendHigh": (Number),
      "domesticTotalLow": (Number),
      "domesticTotalHigh": (Number),
      "internationalTotalLow": (Number),
      "internationalTotalHigh": (Number),
      "confidenceScore": (0-100),
      "reasoning": "Explain the prediction referencing 'Random Forest Budget Weighting', 'Franchise Multiplier', 'Actor Centrality', etc.",
      "factors": [
        { "name": "Log(Budget)", "score": 1-10, "impact": "positive/negative", "description": "Budget impact based on TMDB model" },
        { "name": "Franchise Status", "score": 1-10, "impact": "positive/negative", "description": "Sequel/IP impact" },
        { "name": "Actor Centrality", "score": 1-10, "impact": "positive/negative", "description": "Cast star power density" },
        { "name": "Seasonal Competition", "score": 1-10, "impact": "positive/negative", "description": "Release window density" }
      ],
      "discoveredBudget": (Number in Millions),
      "discoveredCast": ["Name", "Name"],
      "isFranchise": (Boolean),
      "comparables": [
         { "title": "String", "worldwideGross": Number, "year": Number }
      ]
    }
  `;

  // Fix: Use gemini-3-pro-preview for complex reasoning tasks and search tool support
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', 
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const cleanedText = cleanJson(response.text);
  if (!cleanedText || cleanedText === "{}") {
      throw new Error("Empty response from model");
  }

  try {
    const data = JSON.parse(cleanedText);
    data.movieId = movie.id;
    data.movieTitle = movie.title;
    data.timestamp = Date.now();

    // Fix: Extract grounding URLs as per mandatory guidelines for Search tool usage
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      data.groundingUrls = response.candidates[0].groundingMetadata.groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title,
          url: chunk.web.uri
        }));
    }

    return data;
  } catch (e) {
      console.error("Failed to parse model JSON:", response.text);
      throw new Error("Invalid JSON from model");
  }
};

// New function for running backtests
export const generateBacktestPrediction = async (movie: MovieData & { releaseYear: number, actualWorldwide: number }): Promise<BoxOfficeProjection> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
    const prompt = `
      BACKTEST SIMULATION MODE
      Act as if the current date is January 1st, ${movie.releaseYear}.
      DO NOT USE KNOWLEDGE OF THE ACTUAL BOX OFFICE RESULTS.
      Use only data available before ${movie.releaseYear}.

      Apply the same Vitelli/Kaggle prediction model to this "Upcoming" movie:
      
      TARGET MOVIE: "${movie.title}" (${movie.releaseYear})
      STUDIO: ${movie.studio}
      DIRECTOR: ${movie.director}
      CAST: ${movie.cast?.join(', ')}
      BUDGET: $${movie.budget}M

      Predict the Worldwide Box Office based on pre-release hype, star power (centrality), and budget.
      
      Output JSON Format:
      {
        "movieId": "${movie.id}",
        "movieTitle": "${movie.title}",
        "worldwideTotal": (Number in Millions),
        "confidenceScore": (0-100),
        "reasoning": "Explanation based on pre-release indicators only.",
        "discoveredBudget": ${movie.budget}
      }
    `;
  
    // Fix: Use gemini-3-pro-preview for complex tasks
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
    });
  
    const cleanedText = cleanJson(response.text);
    try {
      const data = JSON.parse(cleanedText);
      // Calculate error
      const errorMargin = ((data.worldwideTotal - movie.actualWorldwide) / movie.actualWorldwide) * 100;
      
      return {
        ...data,
        movieId: movie.id,
        movieTitle: movie.title,
        timestamp: Date.now(),
        // Fill required fields with defaults since this is a backtest
        openingWeekendLow: 0,
        openingWeekendHigh: 0,
        domesticTotalLow: 0,
        domesticTotalHigh: 0,
        internationalTotalLow: 0,
        internationalTotalHigh: 0,
        factors: [],
        comparables: [],
        actualWorldwide: movie.actualWorldwide,
        errorMargin: errorMargin
      };
    } catch (e) {
      console.error("Failed to parse backtest JSON:", response.text);
      throw new Error("Invalid JSON from model");
    }
  };
