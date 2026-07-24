/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function ExploreSection() {
  return (
    <section id="explore">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 52px' }}>
        <div style={{ marginBottom: '120px', maxWidth: '560px' }}>
          <span className="exp-intro-lbl">Curated Collections</span>
          <h2 className="exp-intro-h">Explore Our<br />Curations</h2>
          <p className="exp-intro-p">
            Five distinct ways to discover cinema. Each path offers a unique lens into storytelling, community, and the transformative power of film.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
          {/* Watch With Someone */}
          <div className="exp-row exp-fwd">
            <div className="exp-img">
              <div className="r">
                <img src="https://apnmag.com/wp-content/uploads/2021/10/alin-surdu-j5gcqqm3eya-unsplash.jpg" alt="Watch together" />
              </div>
            </div>
            <div className="exp-tf">
              <h3 className="exp-h">Watch With Someone</h3>
              <div className="exp-description">
                <p>Cinema changes when you share it. Discover films curated for every season and every kind of company.</p>
              </div>
              <Link href="/seasons" className="exp-explore-btn">
                Explore seasons <span>→</span>
              </Link>
            </div>
          </div>

          {/* Festival Season */}
          <div className="exp-row exp-rev">
            <div className="exp-tr">
              <h3 className="exp-h">Festival Season</h3>
              <div className="exp-description">
                <p>Where cinema is being redefined. Explore winners from Cannes, Berlin, Venice.</p>
              </div>
              <Link href="/festival-season" className="exp-explore-btn exp-explore-btn-right">
                Explore festivals <span>→</span>
              </Link>
            </div>
            <div className="exp-img">
              <div className="r">
                <img src="https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-476996143.jpg?c=16x9&q=w_800,c_fill" alt="Festival cinema" />
              </div>
            </div>
          </div>

          {/* Cinema by Experience */}
          <div className="exp-row exp-fwd">
            <div className="exp-img">
              <div className="r">
                <img src="https://i.etsystatic.com/60619267/r/il/c0ca47/7192898378/il_1588xN.7192898378_2v9n.jpg" alt="Cinematic craft" />
              </div>
            </div>
            <div className="exp-tf">
              <h3 className="exp-h">Cinema by Experience</h3>
              <div className="exp-description">
                <p>Move beyond emotion. Explore films by visual craft, sound, story twists.</p>
              </div>
              <Link href="/cinema-by-experience" className="exp-explore-btn">
                Explore craft <span>→</span>
              </Link>
            </div>
          </div>

          {/* Staff Picks */}
          <div className="exp-row exp-rev">
            <div className="exp-tr">
              <h3 className="exp-h">Staff Picks</h3>
              <div className="exp-description">
                <p>The What2Watch team (and invited critics and filmmakers) pick their favorites</p>
              </div>
              <Link href="/staff-picks" className="exp-explore-btn exp-explore-btn-right">
                Explore curators <span>→</span>
              </Link>
            </div>
            <div className="exp-img">
              <div className="r">
                <img src="https://i.pinimg.com/1200x/95/33/9e/95339e2896130b4a02d9d828b2740af9.jpg" alt="Curators" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
