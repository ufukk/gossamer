##PROJENİN HEDEFİ

Webdeki genele açık kaynakları asgari gecikme ile kaynağın kendisindeki veri bütünlüğünü koruyarak okumak. 

		"Veri ile birçok şey yapılabilir ancak her zaman güncel veriye sahip olmak gerekiyor."

------
------

###Sorun

Sosyal ağların genele açık API'leri ile içerik üreten web sitelerinin RSS vb. kaynakları, içeriklerini makinelerin okuyabileceği biçimde sunuyor. Ancak her kaynak, verilerini kendine özgü veri hiyerarşisine göre biçimlendiriyor. Bu durumda farklı kaynaklardan okunan veriler içeriğe dönüştürülmek istenir ise, kaynaktaki diğer içeriklerden ayrık, tek seviyeli bir sınıflandırmaya tabi oluyorlar. Ayrıca her kaynağın veri sürekliliği olanaklarının farklı olması, kaynaktaki okunmamış verilerin okunmuş olanlardan ayrıştırılıp keşfedilmesini ve okuma işleminin sürdürülmesini güçleştiriyor.

Bunlardan başka, her kaynağın - özellikle sosyal ağların- sürekli altyapı değişiklikleri ve artan hacimlerinin zorunlu kıldığı kullanım kısıtları, donanıma dayalı olanaklardan önce, hataya müsamahalı ve esnek bir veri okuma stratejisine ihtiyaç duyuyor.    

------

Proje; ortak veri biçimlerine (RSS vb.) olduğu gibi kaynaklara özel -ad hoc- geliştirmelere de olanak verecek bir veri okuma stratejisi ile bu verileri içeriğe dönüştürmekte kullanılacak şemalardan oluşacak.

###Veri Okuma

Veri kaynağı olarak, makinenin okuyabileceği türde veri sağlayan API'ler ve RSS'ler kullanılacak. RSS'e sahip olmayan web siteleri de bir tarayıcı kullanılarak okunabilir ancak sınıflandırılmamış veriyi makinenin okuyabileceği biçime dönüştürmek önceki kaynakların ihtiyaç duymayacağı bir katman gerektirir. (screen scraping)

Sosyal ağlar, hem yoğun veri akışı hem de geniş bir veri havuzu sağlıyorlar ancak kendilerine özgü kısıtları ve kuralları, özel geliştirmeleri zorunlu kılıyor.

API sağlayan kaynaklar, 'anahtar kelimeler' üzerinden takip edilecek. Ancak kaynakların sunduğu tüm veri tiplerinde, anahtar kelime takibine olanak vermesi mümkün olamayacağı için, veriler içeriğe dönüştürülürken bir 'full-text' motoru ile işlenecek (Solr) 

####Sınırlar

++Takip edilecek sayfaları/kısımları bulmak ve bu kısımları veri yoğunluklarına ve amaca uygunluklarına göre sıralamak.

++Sosyal ağların kullanım sınırlarını - rate limits - aşmadan azami veriyi toplamak.

++Veri sürekliliğini sağlamak: Hem güncel verileri yayınlandıktan hemen sonra toplamak hem de takip edilen sayfaların/kısımların (gateway?) verilerini geriye doğru da toplayabilmek.

